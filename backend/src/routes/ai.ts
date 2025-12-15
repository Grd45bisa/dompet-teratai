import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import FormData from 'form-data';
import axios from 'axios';
import sharp from 'sharp';

const router = Router();

// n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.kitapunya.web.id/webhook/analyze-receipt';

// Category name to ID mapping (will be fetched from DB)
let categoryMap: Record<string, string> = {};

// Fetch category mapping from database
async function loadCategoryMap() {
    const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_default', true);

    if (data) {
        categoryMap = {};
        data.forEach((cat) => {
            // Map normalized name to ID
            const normalizedName = cat.name.toLowerCase()
                .replace('makanan & minuman', 'makanan')
                .replace(' ', '');
            categoryMap[normalizedName] = cat.id;

            // Also map the exact name
            categoryMap[cat.name.toLowerCase()] = cat.id;
        });
        console.log('Category map loaded:', Object.keys(categoryMap));
    }
}

// Load on startup
loadCategoryMap();

/**
 * Convert base64 to Buffer for file upload
 */
function base64ToBuffer(base64String: string): { buffer: Buffer; mimeType: string } {
    // Remove data URL prefix if present
    let base64Data = base64String;
    let mimeType = 'image/jpeg';

    if (base64String.includes(',')) {
        const parts = base64String.split(',');
        const header = parts[0];
        base64Data = parts[1];

        // Extract mime type from header (data:image/jpeg;base64)
        const mimeMatch = header.match(/data:([^;]+);/);
        if (mimeMatch) {
            mimeType = mimeMatch[1];
        }
    }

    return {
        buffer: Buffer.from(base64Data, 'base64'),
        mimeType,
    };
}

/**
 * Compress image for AI processing while maintaining detail
 * Max width 1500px, 85% quality JPEG - optimal for OCR
 */
async function compressImageForAI(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; mimeType: string }> {
    // Skip compression for PDF
    if (mimeType === 'application/pdf') {
        return { buffer, mimeType };
    }

    try {
        const compressed = await sharp(buffer)
            .resize(1500, null, {
                withoutEnlargement: true,  // Don't upscale small images
                fit: 'inside'
            })
            .jpeg({ quality: 85 })  // Good quality for OCR
            .toBuffer();

        console.log(`🗜️ Compressed image: ${buffer.length} bytes → ${compressed.length} bytes (${Math.round((1 - compressed.length / buffer.length) * 100)}% reduction)`);

        return {
            buffer: compressed,
            mimeType: 'image/jpeg',
        };
    } catch (error) {
        console.error('Image compression failed, using original:', error);
        return { buffer, mimeType };
    }
}

/**
 * POST /api/ai/analyze-receipt
 * Send image to n8n for AI OCR processing
 */
router.post('/analyze-receipt', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { image, filename } = req.body;

        if (!image) {
            res.status(400).json({ success: false, error: 'No image provided' });
            return;
        }

        console.log('📸 Received image for AI analysis, size:', Math.round(image.length / 1024), 'KB');

        // Convert base64 to buffer
        const { buffer: originalBuffer, mimeType: originalMimeType } = base64ToBuffer(image);

        // Compress image for AI processing (keeps detail but reduces size)
        const { buffer, mimeType } = await compressImageForAI(originalBuffer, originalMimeType);

        const extension = mimeType.split('/')[1] || 'jpg';
        const uploadFilename = filename || `receipt.${extension}`;

        console.log('📤 Sending to n8n as file:', uploadFilename, 'size:', buffer.length, 'bytes');

        // Create form data with actual file
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: uploadFilename,
            contentType: mimeType,
        });

        // Send to n8n webhook using axios (properly handles FormData)
        let n8nResponse;
        try {
            n8nResponse = await axios.post(N8N_WEBHOOK_URL, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 60000, // 60 second timeout for AI processing
            });
        } catch (axiosError: unknown) {
            if (axios.isAxiosError(axiosError)) {
                console.error('n8n webhook error:', axiosError.response?.status, axiosError.response?.data);
                res.status(500).json({
                    success: false,
                    error: 'AI processing failed: ' + (axiosError.response?.data || axiosError.message)
                });
            } else {
                console.error('n8n request error:', axiosError);
                res.status(500).json({ success: false, error: 'Failed to connect to AI service' });
            }
            return;
        }

        console.log('📥 n8n response status:', n8nResponse.status);
        console.log('📥 n8n response data:', JSON.stringify(n8nResponse.data).substring(0, 500));

        // Type for n8n response
        interface N8nAIResponse {
            toko?: string;
            total?: number;
            kategori?: string;
            tanggal?: string;
            alamat?: string;
            catatan?: string;
            confidence?: number;
            error?: string;
        }

        const aiResult = n8nResponse.data as N8nAIResponse;
        console.log('🤖 AI Result:', aiResult);

        // Check for AI error
        if (aiResult.error) {
            res.json({
                success: false,
                error: aiResult.error,
            });
            return;
        }

        // Reload category map if empty
        if (Object.keys(categoryMap).length === 0) {
            await loadCategoryMap();
        }

        // Map kategori string to category_id
        const kategoriLower = (aiResult.kategori || 'lainnya').toLowerCase();
        let categoryId = categoryMap[kategoriLower];

        // Try fuzzy match if exact match not found
        if (!categoryId) {
            for (const [name, id] of Object.entries(categoryMap)) {
                if (name.includes(kategoriLower) || kategoriLower.includes(name)) {
                    categoryId = id;
                    break;
                }
            }
        }

        // Fallback to 'lainnya'
        if (!categoryId) {
            categoryId = categoryMap['lainnya'] || categoryMap['Lainnya'];
        }

        // Return processed data
        res.json({
            success: true,
            data: {
                toko: aiResult.toko || '',
                total: aiResult.total || 0,
                kategori: aiResult.kategori || 'lainnya',
                category_id: categoryId,
                tanggal: aiResult.tanggal || new Date().toISOString().split('T')[0],
                alamat: aiResult.alamat || '',
                catatan: aiResult.catatan || '',
                confidence: aiResult.confidence || 0.8,
            },
        });
    } catch (error) {
        console.error('AI analyze error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze receipt' });
    }
});

/**
 * POST /api/ai/save-expense
 * Save the AI-extracted expense to database
 */
router.post('/save-expense', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { category_id, amount, expense_date, description, receipt_url, attachment_type, attachment_data } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({ success: false, error: 'Invalid amount' });
            return;
        }

        // receipt_url is base64 for images, attachment_data is for PDF
        const { data, error } = await supabase
            .from('expenses')
            .insert({
                user_id: req.user.id,
                category_id,
                amount,
                expense_date: expense_date || new Date().toISOString().split('T')[0],
                description: description || null,
                receipt_url: receipt_url || null,
                attachment_type: attachment_type || null,
                attachment_data: attachment_data || null,
                ai_processed: true,
            })
            .select('*, category:categories(*)')
            .single();

        if (error) {
            console.error('Error saving expense:', error);
            res.status(500).json({ success: false, error: 'Failed to save expense' });
            return;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Save expense error:', error);
        res.status(500).json({ success: false, error: 'Failed to save expense' });
    }
});

export default router;
