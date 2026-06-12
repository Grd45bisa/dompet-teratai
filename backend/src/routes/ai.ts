import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import sharp from 'sharp';
import { analyzeReceiptImage, analyzeReceiptText } from '../services/aiReceiptService';
import { extractPdfText } from '../services/pdfTextService';

const router = Router();

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
 * Convert base64 to Buffer for file processing.
 */
function base64ToBuffer(base64String: string): { buffer: Buffer; mimeType: string } {
    let base64Data = base64String;
    let mimeType = 'image/jpeg';

    if (base64String.includes(',')) {
        const parts = base64String.split(',');
        const header = parts[0];
        base64Data = parts[1];

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
 * Compress image for AI processing while maintaining detail.
 * Max width 1500px, 85% quality JPEG - optimal for OCR.
 */
async function compressImageForAI(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (mimeType === 'application/pdf') {
        return { buffer, mimeType };
    }

    try {
        const compressed = await sharp(buffer)
            .resize(1500, null, {
                withoutEnlargement: true,
                fit: 'inside',
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        console.log(`Compressed image: ${buffer.length} bytes -> ${compressed.length} bytes (${Math.round((1 - compressed.length / buffer.length) * 100)}% reduction)`);

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
 * Analyze receipt directly in backend using NVIDIA AI API.
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

        console.log('Received file for AI analysis, size:', Math.round(image.length / 1024), 'KB');

        const { buffer: originalBuffer, mimeType: originalMimeType } = base64ToBuffer(image);
        const { buffer, mimeType } = await compressImageForAI(originalBuffer, originalMimeType);

        console.log('Processing file with backend AI:', filename || 'receipt', 'mime:', mimeType, 'size:', buffer.length, 'bytes');

        let aiResult;

        if (mimeType === 'application/pdf') {
            let extractedText = '';

            try {
                extractedText = await extractPdfText(buffer);
            } catch (pdfError) {
                console.error('PDF extraction error:', pdfError);
                res.status(400).json({
                    success: false,
                    error: 'Gagal mengekstrak teks dari PDF. Coba upload gambar struk atau PDF dengan teks yang bisa diseleksi.',
                });
                return;
            }

            if (!extractedText) {
                res.status(400).json({
                    success: false,
                    error: 'PDF tidak memiliki teks yang bisa diekstrak. Coba upload gambar struk atau PDF berbasis teks.',
                });
                return;
            }

            aiResult = await analyzeReceiptText(extractedText);
        } else if (mimeType.startsWith('image/')) {
            aiResult = await analyzeReceiptImage({ buffer, mimeType });
        } else {
            res.status(400).json({ success: false, error: 'Unsupported file type' });
            return;
        }

        console.log('AI Result:', aiResult);

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

        if (error instanceof Error && error.message === 'NVIDIA_API_KEY is not configured') {
            res.status(500).json({ success: false, error: 'NVIDIA_API_KEY belum dikonfigurasi di backend.' });
            return;
        }

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
