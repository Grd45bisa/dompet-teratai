import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    ChatHistoryItem,
    ChatPendingAction,
    createExpenseFromChat,
    generateChatReply,
    isAffirmativeMessage,
    isNegativeMessage,
} from '../services/aiChatService';
import { emitToUser, SocketEvents } from '../config/socket';

const router = Router();

router.use(authMiddleware);

router.post('/message', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { message, history, pending_action } = req.body as {
            message?: string;
            history?: ChatHistoryItem[];
            pending_action?: ChatPendingAction | null;
        };

        const trimmedMessage = (message || '').trim();

        if (!trimmedMessage) {
            res.status(400).json({ success: false, error: 'Message is required' });
            return;
        }

        if (pending_action?.type === 'create_expense') {
            if (isAffirmativeMessage(trimmedMessage)) {
                const expense = await createExpenseFromChat(req.user, pending_action.draft);
                emitToUser(req.user.id, SocketEvents.EXPENSE_CREATED, expense);

                res.json({
                    success: true,
                    data: {
                        reply: `Siap, pengeluaran Rp${Math.round(pending_action.draft.amount).toLocaleString('id-ID')} sudah aku catat.`,
                        pending_action: null,
                        expense_created: expense,
                        suggested_prompts: ['Catat pengeluaran lagi', 'Lihat transaksi', 'Cek budget'],
                    },
                });
                return;
            }

            if (isNegativeMessage(trimmedMessage)) {
                res.json({
                    success: true,
                    data: {
                        reply: 'Oke, draft pencatatannya aku batalkan.',
                        pending_action: null,
                        suggested_prompts: ['Catat pengeluaran lagi', 'Cara pakai chatbot', 'Cek budget'],
                    },
                });
                return;
            }
        }

        const result = await generateChatReply(req.user, trimmedMessage, Array.isArray(history) ? history : []);
        res.json({
            success: true,
            data: {
                reply: result.reply,
                pending_action: result.pendingAction,
                suggested_prompts: result.suggestedPrompts,
            },
        });
    } catch (error) {
        console.error('Chat message error:', error);

        if (error instanceof Error && error.message === 'NVIDIA_API_KEY is not configured') {
            res.json({
                success: true,
                data: {
                    reply: 'Backend chat belum dikonfigurasi penuh, tapi aku masih siap nerima pesanmu. Coba lagi sebentar setelah konfigurasi AI beres ya.',
                    pending_action: null,
                    suggested_prompts: ['Halo', 'Bisa bantu apa?', 'Kasih ide pertanyaan'],
                },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                reply: 'Tadi sempat ada gangguan kecil waktu memproses chat, tapi kita masih bisa lanjut. Coba kirim ulang atau tulis ulang pertanyaanmu dengan singkat.',
                pending_action: null,
                suggested_prompts: ['Halo', 'Coba lagi', 'Kasih ide pertanyaan'],
            },
        });
    }
});

export default router;
