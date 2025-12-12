import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, CreateCategoryRequest } from '../types';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/categories
 * Get all categories (default + user's custom categories)
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${req.user.id},is_default.eq.true`)
            .order('is_default', { ascending: false })
            .order('name');

        if (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ success: false, error: 'Failed to get categories' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Failed to get categories' });
    }
});

/**
 * POST /api/categories
 * Create custom category
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { name, color } = req.body as CreateCategoryRequest;

        if (!name || !color) {
            res.status(400).json({ success: false, error: 'Name and color are required' });
            return;
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({
                user_id: req.user.id,
                name: name.trim(),
                color,
                is_default: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Create category error:', error);
            res.status(500).json({ success: false, error: 'Failed to create category' });
            return;
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, error: 'Failed to create category' });
    }
});

/**
 * PUT /api/categories/:id
 * Update category
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;
        const { name, color } = req.body as CreateCategoryRequest;

        // Check if category exists and belongs to user (or is default)
        const { data: existing } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (!existing) {
            res.status(404).json({ success: false, error: 'Category not found' });
            return;
        }

        // Can't edit default categories
        if (existing.is_default) {
            res.status(403).json({ success: false, error: 'Cannot edit default categories' });
            return;
        }

        // Must own the category
        if (existing.user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        const updateData: { name?: string; color?: string } = {};
        if (name) updateData.name = name.trim();
        if (color) updateData.color = color;

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update category error:', error);
            res.status(500).json({ success: false, error: 'Failed to update category' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, error: 'Failed to update category' });
    }
});

/**
 * DELETE /api/categories/:id
 * Delete category
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { id } = req.params;

        // Check if category exists and belongs to user
        const { data: existing } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (!existing) {
            res.status(404).json({ success: false, error: 'Category not found' });
            return;
        }

        // Can't delete default categories
        if (existing.is_default) {
            res.status(403).json({ success: false, error: 'Cannot delete default categories' });
            return;
        }

        // Must own the category
        if (existing.user_id !== req.user.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete category' });
            return;
        }

        res.json({ success: true, data: { id } });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete category' });
    }
});

export default router;
