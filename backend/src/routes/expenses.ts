import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, CreateExpenseRequest, UpdateExpenseRequest } from '../types';
import { emitToUser, SocketEvents } from '../config/socket';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/expenses
 * Get expenses for current user with optional filters
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { from, to, category_id, limit = '50', offset = '0' } = req.query;

        let query = supabase
            .from('expenses')
            .select('*, category:categories(*)')
            .eq('user_id', req.user.id)
            .order('expense_date', { ascending: false })
            .order('created_at', { ascending: false });

        // Apply filters
        if (from) {
            query = query.gte('expense_date', from as string);
        }
        if (to) {
            query = query.lte('expense_date', to as string);
        }
        if (category_id) {
            query = query.eq('category_id', category_id as string);
        }

        // Pagination
        const limitNum = parseInt(limit as string, 10);
        const offsetNum = parseInt(offset as string, 10);
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Get expenses error:', error);
            res.status(500).json({ success: false, error: 'Failed to get expenses' });
            return;
        }

        res.json({
            success: true,
            data,
            count,
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ success: false, error: 'Failed to get expenses' });
    }
});

/**
 * POST /api/expenses
 * Create new expense
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { category_id, amount, description, expense_date, receipt_url, attachment_type, attachment_data } = req.body as CreateExpenseRequest;

        // Validation
        if (!category_id || !amount || !expense_date) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        if (amount <= 0) {
            res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
            return;
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert({
                user_id: req.user.id,
                category_id,
                amount,
                description: description || null,
                expense_date,
                receipt_url: receipt_url || null,
                attachment_type: attachment_type || null,
                attachment_data: attachment_data || null,
            })
            .select('*, category:categories(*)')
            .single();

        if (error) {
            console.error('Create expense error:', error);
            res.status(500).json({ success: false, error: 'Failed to create expense' });
            return;
        }

        // Emit WebSocket event
        emitToUser(req.user.id, SocketEvents.EXPENSE_CREATED, data);

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ success: false, error: 'Failed to create expense' });
    }
});

/**
 * PUT /api/expenses/:id
 * Update expense
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const updates = req.body as UpdateExpenseRequest;

        // Verify ownership
        const { data: existing } = await supabase
            .from('expenses')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!existing || existing.user_id !== req.user.id) {
            res.status(404).json({ success: false, error: 'Expense not found' });
            return;
        }

        const { data, error } = await supabase
            .from('expenses')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*, category:categories(*)')
            .single();

        if (error) {
            console.error('Update expense error:', error);
            res.status(500).json({ success: false, error: 'Failed to update expense' });
            return;
        }

        // Emit WebSocket event
        emitToUser(req.user.id, SocketEvents.EXPENSE_UPDATED, data);

        res.json({ success: true, data });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ success: false, error: 'Failed to update expense' });
    }
});

/**
 * DELETE /api/expenses/:id
 * Delete expense
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;

        // Verify ownership
        const { data: existing } = await supabase
            .from('expenses')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!existing || existing.user_id !== req.user.id) {
            res.status(404).json({ success: false, error: 'Expense not found' });
            return;
        }

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete expense error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete expense' });
            return;
        }

        // Emit WebSocket event
        emitToUser(req.user.id, SocketEvents.EXPENSE_DELETED, { id });

        res.json({ success: true, data: { id } });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete expense' });
    }
});

export default router;
