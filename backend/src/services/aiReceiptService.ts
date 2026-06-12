import OpenAI from 'openai';
import { getAIClient, getAIModel } from './aiClient';

export interface AIReceiptExtraction {
    toko: string;
    total: number;
    kategori: string;
    tanggal: string;
    alamat: string;
    catatan: string;
    confidence: number;
}

interface AnalyzeImageInput {
    buffer: Buffer;
    mimeType: string;
}

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

function buildSystemPrompt(): string {
    return [
        'Anda adalah ekstraktor data struk dan invoice untuk aplikasi pencatat pengeluaran.',
        'Balas hanya JSON valid tanpa markdown, tanpa penjelasan, dan tanpa teks tambahan.',
        'Gunakan bahasa Indonesia untuk kategori dan catatan.',
        'Field catatan harus berupa alasan/tujuan pembelian yang santai dan manusiawi, bukan nomor POS, nomor struk, check number, kasir, atau metadata transaksi.',
        'Contoh catatan yang baik: "Belanja kebutuhan harian", "Makan siang di luar", "Beli perlengkapan rumah", atau "Bayar kebutuhan transportasi".',
        'Jika ada nilai yang tidak terbaca, gunakan string kosong, 0, atau tanggal hari ini sesuai field.',
        'Total harus number dalam Rupiah tanpa pemisah ribuan.',
        'Tanggal harus format YYYY-MM-DD.',
    ].join(' ');
}

function buildExtractionPrompt(today: string, sourceType: 'image' | 'pdf-text'): string {
    return [
        `Tanggal hari ini: ${today}.`,
        sourceType === 'image'
            ? 'Analisis gambar struk/invoice berikut.'
            : 'Analisis teks hasil ekstraksi PDF invoice/struk berikut.',
        'Ekstrak data utama dan tentukan kategori pengeluaran paling sesuai.',
        'Untuk catatan, tulis ringkasan alasan pembelian dengan bahasa santai berdasarkan nama toko dan item yang terbaca. Jangan salin metadata seperti POS, check number, nomor invoice, jam transaksi, atau nama kasir.',
        'Format JSON wajib:',
        '{"toko":"string","total":0,"kategori":"string","tanggal":"YYYY-MM-DD","alamat":"string","catatan":"string","confidence":0.8}',
    ].join('\n');
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

function normalizeConfidence(value: unknown): number {
    const numberValue = toNumberValue(value);
    if (numberValue <= 0) return 0.8;
    if (numberValue > 1) return Math.min(numberValue / 100, 1);
    return Math.min(numberValue, 1);
}

function normalizeNote(value: unknown): string {
    const note = toStringValue(value);
    if (!note) return '';

    const metadataPattern = /\b(pos|check|checker|cashier|kasir|struk|receipt|invoice|transaction|transaksi|no\.?|number|nomor)\b|[:#]\s*\d{3,}/i;
    if (metadataPattern.test(note)) {
        return '';
    }

    return note;
}

function normalizeAIResult(raw: Record<string, unknown>, fallbackDate: string): AIReceiptExtraction {
    return {
        toko: toStringValue(raw.toko),
        total: Math.max(0, Math.round(toNumberValue(raw.total))),
        kategori: toStringValue(raw.kategori) || 'lainnya',
        tanggal: normalizeDate(raw.tanggal, fallbackDate),
        alamat: toStringValue(raw.alamat),
        catatan: normalizeNote(raw.catatan),
        confidence: normalizeConfidence(raw.confidence),
    };
}

async function createCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    const client = getAIClient();

    return client.chat.completions.create({
        model: getAIModel(),
        messages,
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 2048,
        reasoning_budget: 1024,
        chat_template_kwargs: { enable_thinking: false },
        stream: false,
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);
}

export async function analyzeReceiptImage(input: AnalyzeImageInput): Promise<AIReceiptExtraction> {
    const today = getTodayDate();
    const dataUrl = `data:${input.mimeType};base64,${input.buffer.toString('base64')}`;
    const completion = await createCompletion([
        {
            role: 'system',
            content: buildSystemPrompt(),
        },
        {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: buildExtractionPrompt(today, 'image'),
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: dataUrl,
                    },
                },
            ],
        },
    ]);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('AI returned an empty response');
    }

    return normalizeAIResult(extractJsonObject(content), today);
}

export async function analyzeReceiptText(text: string): Promise<AIReceiptExtraction> {
    const today = getTodayDate();
    const completion = await createCompletion([
        {
            role: 'system',
            content: buildSystemPrompt(),
        },
        {
            role: 'user',
            content: `${buildExtractionPrompt(today, 'pdf-text')}\n\nTeks PDF:\n${text.slice(0, 20000)}`,
        },
    ]);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('AI returned an empty response');
    }

    return normalizeAIResult(extractJsonObject(content), today);
}
