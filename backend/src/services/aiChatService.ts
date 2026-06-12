import OpenAI from 'openai';
import { supabase } from '../config/supabase';
import { Category, Expense, User } from '../types';
import { getAIClient, getAIModel } from './aiClient';

export interface ChatHistoryItem {
    role: 'user' | 'assistant';
    text: string;
}

export interface ChatExpenseDraft {
    toko: string;
    amount: number;
    expense_date: string;
    category_name: string;
    category_id: string;
    description: string;
}

export interface ChatPendingAction {
    type: 'create_expense';
    draft: ChatExpenseDraft;
}

export interface ChatResult {
    reply: string;
    pendingAction: ChatPendingAction | null;
    suggestedPrompts: string[];
}

interface DraftExtractionResult {
    should_record: boolean;
    amount?: number | string;
    toko?: string;
    expense_date?: string;
    category_name?: string;
    description?: string;
    missing_fields?: string[];
    reply?: string;
}

interface UserExpenseSnapshot {
    currentMonthTotal: number;
    monthlyBudget: number;
    budgetUsageRatio: number;
    transactionCount: number;
    topCategoryName: string | null;
    topCategoryTotal: number;
}

const defaultChatSuggestions = [
    'Cara catat pengeluaran',
    'Bantu catat transaksi',
    'Jelasin fitur chatbot',
];

const systemPrompt = [
    'Kamu adalah Asisten Kampung Jati untuk aplikasi Kampung Jati.',
    'Bantu hanya soal fitur aplikasi, pengeluaran, transaksi, budget, kategori, laporan, struk, invoice, dan PDF.',
    'Jawab ringkas, jelas, dan pakai bahasa Indonesia yang santai. Tetap enak dibaca, jangan terlalu kaku.',
    'Tulis jawaban sebagai teks biasa, tanpa markdown, tanpa **bold**, tanpa heading, dan tanpa daftar yang tidak perlu.',
    'Jangan melebar, jangan mengarang data, dan jangan mengaku sudah menyimpan data kalau belum.',
    'Kalau pertanyaan di luar konteks aplikasi ini, tolak singkat lalu arahkan ke topik yang relevan.',
].join(' ');

function normalizeMessage(message: string): string {
    return message.trim().toLowerCase();
}

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

function startOfCurrentMonth(): string {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
}

function toStringValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function toNumberValue(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function normalizeDate(value: unknown, fallback: string): string {
    const dateString = toStringValue(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    const parsed = Date.parse(dateString);
    if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString().split('T')[0];
    }

    return fallback;
}

function extractJsonObject(content: string): Record<string, unknown> {
    const trimmed = content.trim();
    const withoutFence = trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    try {
        return JSON.parse(withoutFence) as Record<string, unknown>;
    } catch {
        const match = withoutFence.match(/\{[\s\S]*\}/);
        if (!match) {
            throw new Error('AI response did not contain JSON');
        }

        return JSON.parse(match[0]) as Record<string, unknown>;
    }
}

function normalizeCategoryName(name: string): string {
    return name.toLowerCase().replace(/&/g, 'dan').replace(/\s+/g, ' ').trim();
}

function findCategory(categories: Category[], requestedName: string): Category | null {
    if (!requestedName) {
        return categories.find((category) => normalizeCategoryName(category.name) === 'lainnya') || null;
    }

    const normalizedRequest = normalizeCategoryName(requestedName);
    const exactMatch = categories.find((category) => normalizeCategoryName(category.name) === normalizedRequest);
    if (exactMatch) {
        return exactMatch;
    }

    const fuzzyMatch = categories.find((category) => {
        const normalizedCategory = normalizeCategoryName(category.name);
        return normalizedCategory.includes(normalizedRequest) || normalizedRequest.includes(normalizedCategory);
    });

    if (fuzzyMatch) {
        return fuzzyMatch;
    }

    return categories.find((category) => normalizeCategoryName(category.name) === 'lainnya') || null;
}

function buildFallbackReply(message: string): string {
    const normalized = normalizeMessage(message);

    if (!normalized) {
        return 'Boleh, kirim pesan lagi aja. Aku siap bantu.';
    }

    if (/jangan|ga usah|nggak usah|tidak usah/.test(normalized) && /pengeluaran|nominal|saldo|budget/.test(normalized)) {
        return 'Siap, aku nggak bakal bahas nominal pengeluaran kalau kamu nggak minta. Lanjut aja ya.';
    }

    if (/siapa kamu|kamu siapa/.test(normalized)) {
        return 'Aku Asisten Kampung Jati. Aku bantu soal pencatatan pengeluaran dan fitur-fitur di aplikasi ini.';
    }

    if (/hai|halo|hi|hei|hey/.test(normalized)) {
        return 'Halo. Aku siap bantu catat pengeluaran atau jelasin fitur aplikasi ini.';
    }

    if (/lagi apa/.test(normalized)) {
        return 'Lagi standby di sini buat bantu chat kamu.';
    }

    return 'Aku paham maksudnya. Kalau kamu mau, aku bisa bantu catat pengeluaran atau jelasin fitur yang kamu perlukan.';
}

function looksLikeExpenseMessage(message: string): boolean {
    const normalized = normalizeMessage(message);
    return /catat|catetin|catetin dong|simpan|masukin|input|tadi|beli|bayar|jajan|habis|keluar uang|pengeluaran|transaksi/.test(normalized)
        && /\d/.test(normalized);
}

function wantsUserExpenseData(message: string): boolean {
    const normalized = normalizeMessage(message);

    return [
        /pengeluaran(ku| saya)? .*bulan ini/,
        /berapa .*pengeluaran(ku| saya)?/,
        /total .*bulan ini/,
        /ringkas(an)? .*pengeluaran/,
        /budget(ku| saya)?/,
        /sisa budget/,
        /kategori .*boros/,
        /pengeluaran .*terbanyak/,
        /uang(ku| saya)? .*habis/,
    ].some((pattern) => pattern.test(normalized));
}

function formatIdr(amount: number): string {
    return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

async function getUserExpenseSnapshot(user: User): Promise<UserExpenseSnapshot> {
    const monthStart = startOfCurrentMonth();
    const { data, error } = await supabase
        .from('expenses')
        .select('amount, category:categories(name)')
        .eq('user_id', user.id)
        .gte('expense_date', monthStart);

    if (error) {
        throw new Error(`Failed to load user expenses: ${error.message}`);
    }

    const expenses = (data || []) as Array<{ amount: number; category?: { name?: string } | null }>;
    const currentMonthTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const transactionCount = expenses.length;
    const monthlyBudget = Number(user.monthly_budget || 0);
    const budgetUsageRatio = monthlyBudget > 0 ? currentMonthTotal / monthlyBudget : 0;

    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense) => {
        const name = expense.category?.name || 'Lainnya';
        categoryTotals.set(name, (categoryTotals.get(name) || 0) + Number(expense.amount || 0));
    });

    const [topCategoryName, topCategoryTotal] = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];

    return {
        currentMonthTotal,
        monthlyBudget,
        budgetUsageRatio,
        transactionCount,
        topCategoryName,
        topCategoryTotal,
    };
}

function buildExpenseSnapshotReply(message: string, snapshot: UserExpenseSnapshot): string {
    const normalized = normalizeMessage(message);
    const budgetPercent = Math.round(snapshot.budgetUsageRatio * 100);

    if (/kategori .*boros|pengeluaran .*terbanyak/.test(normalized)) {
        if (!snapshot.topCategoryName) {
            return 'Bulan ini belum ada data pengeluaran yang bisa aku cek.';
        }

        return `Bulan ini pengeluaran paling besar ada di kategori ${snapshot.topCategoryName}, totalnya ${formatIdr(snapshot.topCategoryTotal)}.`;
    }

    if (/budget|sisa budget/.test(normalized)) {
        if (snapshot.monthlyBudget <= 0) {
            return `Pengeluaran bulan ini ${formatIdr(snapshot.currentMonthTotal)}. Budget bulanan kamu belum diatur, jadi aku belum bisa bandingin.`;
        }

        const remaining = snapshot.monthlyBudget - snapshot.currentMonthTotal;
        if (remaining >= 0) {
            return `Bulan ini pengeluaran kamu ${formatIdr(snapshot.currentMonthTotal)} dari budget ${formatIdr(snapshot.monthlyBudget)}. Sisa budgetnya sekitar ${formatIdr(remaining)}.`;
        }

        return `Bulan ini pengeluaran kamu ${formatIdr(snapshot.currentMonthTotal)} dari budget ${formatIdr(snapshot.monthlyBudget)}. Kamu sudah lewat sekitar ${formatIdr(Math.abs(remaining))}.`;
    }

    if (/ringkas(an)? .*pengeluaran/.test(normalized)) {
        if (snapshot.transactionCount === 0) {
            return 'Bulan ini belum ada transaksi yang tercatat.';
        }

        const topCategoryText = snapshot.topCategoryName
            ? ` Pengeluaran paling besar ada di ${snapshot.topCategoryName} sebesar ${formatIdr(snapshot.topCategoryTotal)}.`
            : '';

        const budgetText = snapshot.monthlyBudget > 0
            ? ` Budget terpakai sekitar ${budgetPercent}%.`
            : '';

        return `Bulan ini total pengeluaran kamu ${formatIdr(snapshot.currentMonthTotal)} dari ${snapshot.transactionCount} transaksi.${topCategoryText}${budgetText}`;
    }

    return `Bulan ini total pengeluaran kamu ${formatIdr(snapshot.currentMonthTotal)}.`;
}

function buildMessageHistory(history: ChatHistoryItem[], message: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const trimmedHistory = history
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && item.text.trim())
        .slice(-8)
        .map((item) => ({
            role: item.role,
            content: item.text.trim(),
        })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    return [
        {
            role: 'system',
            content: systemPrompt,
        },
        ...trimmedHistory,
        {
            role: 'user',
            content: message,
        },
    ];
}

async function createCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], temperature = 0.45) {
    const client = getAIClient();

    return client.chat.completions.create({
        model: getAIModel(),
        messages,
        temperature,
        top_p: 0.95,
        max_tokens: 900,
        reasoning_budget: 768,
        chat_template_kwargs: { enable_thinking: false },
        stream: false,
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);
}

async function getCategoriesForUser(user: User): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name');

    if (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
    }

    return (data || []) as Category[];
}

async function extractExpenseDraft(user: User, history: ChatHistoryItem[], message: string): Promise<ChatPendingAction | null> {
    if (!looksLikeExpenseMessage(message)) {
        return null;
    }

    const categories = await getCategoriesForUser(user);
    const categoryNames = categories.map((category) => category.name).join(', ');

    const extractionMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: [
                'Ekstrak draft pengeluaran dari pesan user terakhir.',
                'Pakai hanya pesan user terakhir sebagai sumber utama.',
                'Balas JSON valid saja.',
                'Kalau user tidak sedang ingin mencatat pengeluaran, set should_record=false.',
                'Kategori harus dipilih dari daftar kategori yang diberikan, atau Lainnya kalau tidak yakin.',
                'Kalau ada data yang belum jelas, isi missing_fields dan reply singkat untuk minta kelengkapan.',
            ].join(' '),
        },
        ...history
            .filter((item) => item.text.trim())
            .slice(-6)
            .map((item) => ({
                role: item.role,
                content: item.text.trim(),
            })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        {
            role: 'user',
            content: [
                `Kategori tersedia: ${categoryNames || 'Lainnya'}`,
                `Hari ini: ${getTodayDate()}`,
                `Pesan user terakhir: ${message}`,
                'Format JSON:',
                '{"should_record":true,"amount":0,"toko":"","expense_date":"YYYY-MM-DD","category_name":"","description":"","missing_fields":[],"reply":""}',
            ].join('\n'),
        },
    ];

    const completion = await createCompletion(extractionMessages, 0.2);
    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
        return null;
    }

    const raw = extractJsonObject(content) as unknown as DraftExtractionResult;
    if (!raw.should_record) {
        return null;
    }

    const amount = Math.max(0, Math.round(toNumberValue(raw.amount)));
    const category = findCategory(categories, toStringValue(raw.category_name));
    const draft: ChatExpenseDraft = {
        toko: toStringValue(raw.toko),
        amount,
        expense_date: normalizeDate(raw.expense_date, getTodayDate()),
        category_name: category?.name || 'Lainnya',
        category_id: category?.id || '',
        description: toStringValue(raw.description),
    };

    const missingFields = Array.isArray(raw.missing_fields)
        ? raw.missing_fields.map((field) => toStringValue(field)).filter(Boolean)
        : [];

    if (amount <= 0 || !draft.category_id || missingFields.length > 0) {
        return null;
    }

    return {
        type: 'create_expense',
        draft,
    };
}

export function isAffirmativeMessage(message: string): boolean {
    return /^(ya|iya|yup|yes|oke|ok|lanjut|catat|simpan|jadi|boleh|gas)\b/i.test(message.trim());
}

export function isNegativeMessage(message: string): boolean {
    return /^(tidak|nggak|gak|jangan|batal|stop|enggak|ga jadi)\b/i.test(message.trim());
}

export async function createExpenseFromChat(user: User, draft: ChatExpenseDraft): Promise<Expense> {
    const description = [draft.toko, draft.description].filter(Boolean).join(' - ');

    const { data, error } = await supabase
        .from('expenses')
        .insert({
            user_id: user.id,
            category_id: draft.category_id,
            amount: draft.amount,
            description: description || null,
            expense_date: draft.expense_date,
            ai_processed: true,
        })
        .select('*, category:categories(*)')
        .single();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create expense from chat');
    }

    return data as Expense;
}

export async function generateChatReply(user: User, message: string, history: ChatHistoryItem[] = []): Promise<ChatResult> {
    try {
        const pendingAction = await extractExpenseDraft(user, history, message);
        if (pendingAction) {
            return {
                reply: 'Aku sudah siapin draft pencatatannya. Cek dulu ya, kalau sudah cocok tinggal tekan "Ya, catat".',
                pendingAction,
                suggestedPrompts: ['Ya, catat', 'Ganti kategorinya', 'Batal dulu'],
            };
        }

        if (wantsUserExpenseData(message)) {
            const snapshot = await getUserExpenseSnapshot(user);

            return {
                reply: buildExpenseSnapshotReply(message, snapshot),
                pendingAction: null,
                suggestedPrompts: ['Cek budget bulan ini', 'Kategori paling boros', 'Ringkas pengeluaran bulan ini'],
            };
        }

        const completion = await createCompletion(buildMessageHistory(history, message));
        const reply = completion.choices[0]?.message?.content?.trim();

        return {
            reply: reply || buildFallbackReply(message),
            pendingAction: null,
            suggestedPrompts: defaultChatSuggestions,
        };
    } catch (error) {
        console.error('Chat AI provider error:', error);

        return {
            reply: buildFallbackReply(message),
            pendingAction: null,
            suggestedPrompts: defaultChatSuggestions,
        };
    }
}
