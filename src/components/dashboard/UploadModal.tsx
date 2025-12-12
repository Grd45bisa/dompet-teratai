import { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, Sparkles, Save, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiApi, categoriesApi, expensesApi, Category } from '../../lib/api';
import { format } from 'date-fns';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Compress image while maintaining good quality
 */
async function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                } else {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
            }

            let dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Image state
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);
    const [showZoomModal, setShowZoomModal] = useState(false);

    // Form state
    const [storeName, setStoreName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [storeAddress, setStoreAddress] = useState('');
    const [notes, setNotes] = useState('');

    // Other state
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Load categories
    useEffect(() => {
        if (isOpen && user) {
            categoriesApi.getCategories().then((result) => {
                if (result.success && result.data) {
                    setCategories(result.data);
                }
            });
        }
    }, [isOpen, user]);

    // Reset form on close
    const resetForm = () => {
        setImageUrl(null);
        setStoreName('');
        setCategoryId('');
        setAmount('');
        setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
        setStoreAddress('');
        setNotes('');
        setZoomLevel(1);
        setShowZoomModal(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file maksimal 10MB');
            return;
        }

        setIsCompressing(true);
        try {
            const compressed = await compressImage(file);
            setImageUrl(compressed);
        } catch (error) {
            console.error('Compression error:', error);
            alert('Gagal memproses gambar');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    // Analyze receipt with AI
    const handleAnalyze = async () => {
        if (!imageUrl) return;

        setIsAnalyzing(true);
        try {
            const result = await aiApi.analyzeReceipt(imageUrl, 'receipt.jpg');

            if (result.success && result.data) {
                const data = result.data;
                setStoreName(data.toko || '');
                setCategoryId(data.category_id || '');
                setAmount(data.total ? data.total.toString() : '');
                setExpenseDate(data.tanggal || format(new Date(), 'yyyy-MM-dd'));
                setStoreAddress(data.alamat || '');
                setNotes(data.catatan || '');
            } else {
                alert(result.error || 'Gagal menganalisis struk');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Terjadi kesalahan saat menganalisis struk');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Save expense
    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (!categoryId) {
            alert('Pilih kategori');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            alert('Masukkan jumlah yang valid');
            return;
        }
        if (!expenseDate) {
            alert('Pilih tanggal');
            return;
        }

        setIsSaving(true);
        try {
            const description = [storeName, storeAddress, notes]
                .filter(Boolean)
                .join(' - ');

            const result = await expensesApi.createExpense({
                category_id: categoryId,
                amount: parseFloat(amount),
                expense_date: expenseDate,
                description: description || undefined,
                receipt_url: imageUrl || undefined,
            });

            if (result.success) {
                handleClose();
            } else {
                alert(result.error || 'Gagal menyimpan pengeluaran');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Terjadi kesalahan saat menyimpan');
        } finally {
            setIsSaving(false);
        }
    };

    // Format amount with thousand separators
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
    };

    const formatDisplayAmount = (value: string) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(value));
    };

    // Zoom handlers - smaller increments for precise control
    const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
    const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
    const handleZoomReset = () => setZoomLevel(0.5);

    if (!isOpen) return null;

    return (
        <>
            <div className="upload-modal-overlay">
                {/* Overlay */}
                <div
                    className="upload-modal-backdrop"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="upload-modal-container">
                    {/* Header */}
                    <div className="upload-modal-header">
                        <h2 className="upload-modal-title">Add New Expense</h2>
                        <button
                            onClick={handleClose}
                            className="upload-modal-close-btn"
                        >
                            <X />
                        </button>
                    </div>

                    {/* Content - Scrollable on mobile */}
                    <div className="upload-modal-content">
                        {/* Left - Upload Area */}
                        <div className="upload-modal-left">
                            <div
                                ref={dropZoneRef}
                                onClick={() => !imageUrl && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`upload-modal-dropzone ${isDragging ? 'upload-modal-dropzone-active' : ''} ${imageUrl ? 'upload-modal-dropzone-has-image' : ''}`}
                            >
                                {isCompressing ? (
                                    <div className="upload-modal-processing">
                                        <Loader2 className="upload-modal-processing-spinner" />
                                        <p className="upload-modal-processing-text">Processing...</p>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt="Receipt"
                                            className="upload-modal-preview-img"
                                        />
                                        {/* Zoom button overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowZoomModal(true);
                                            }}
                                            className="upload-modal-img-btn upload-modal-zoom-btn"
                                        >
                                            <ZoomIn />
                                        </button>
                                        {/* Change image button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="upload-modal-img-btn upload-modal-change-btn"
                                        >
                                            Change
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="upload-modal-dropzone-icon-wrapper">
                                            <Camera />
                                        </div>
                                        <div className="upload-modal-dropzone-text-wrapper">
                                            <p className="upload-modal-dropzone-title">Upload Receipt</p>
                                            <p className="upload-modal-dropzone-subtitle">Click or drag file here</p>
                                        </div>
                                        <span className="upload-modal-dropzone-badge">
                                            Max 10MB
                                        </span>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="upload-modal-hidden"
                            />

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!imageUrl || isAnalyzing}
                                className={`upload-modal-analyze-btn ${imageUrl ? 'upload-modal-analyze-btn-active' : ''}`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="upload-modal-processing-spinner" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles />
                                        Analyze Receipt
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Right - Form */}
                        <div className="upload-modal-right">
                            {/* Store Name */}
                            <div className="upload-modal-form-group">
                                <label className="upload-modal-label">
                                    Store Name *
                                </label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="e.g. BreadTalk, Walmart"
                                    className="upload-modal-input"
                                />
                            </div>

                            {/* Category */}
                            <div className="upload-modal-form-group">
                                <label className="upload-modal-label">
                                    Category *
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="upload-modal-select"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="upload-modal-form-group">
                                <label className="upload-modal-label">
                                    Amount (Rp) *
                                </label>
                                <div className="upload-modal-amount-wrapper">
                                    <span className="upload-modal-amount-prefix">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatDisplayAmount(amount)}
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="upload-modal-input upload-modal-amount-input"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="upload-modal-form-group">
                                <label className="upload-modal-label">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    className="upload-modal-input"
                                />
                            </div>

                            {/* Store Address - Hidden on mobile for less clutter */}
                            <div className="upload-modal-form-group upload-modal-desktop-only">
                                <label className="upload-modal-label">
                                    Store Address
                                </label>
                                <input
                                    type="text"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    placeholder="e.g. Main Street Mall"
                                    className="upload-modal-input"
                                />
                            </div>

                            {/* Notes */}
                            <div className="upload-modal-form-group">
                                <label className="upload-modal-label">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Optional notes..."
                                    className="upload-modal-textarea"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="upload-modal-actions">
                                <button
                                    onClick={handleClose}
                                    className="upload-modal-cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !categoryId || !amount}
                                    className="upload-modal-save-btn"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="upload-modal-processing-spinner" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zoom Modal */}
            {showZoomModal && imageUrl && (
                <div className="upload-modal-zoom-overlay">
                    {/* Close button */}
                    <button
                        onClick={() => setShowZoomModal(false)}
                        className="upload-modal-zoom-close"
                    >
                        <X />
                    </button>

                    {/* Zoom controls */}
                    <div className="upload-modal-zoom-controls">
                        <button
                            onClick={handleZoomOut}
                            className="upload-modal-zoom-ctrl-btn"
                        >
                            <ZoomOut />
                        </button>
                        <span className="upload-modal-zoom-level">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="upload-modal-zoom-ctrl-btn"
                        >
                            <ZoomIn />
                        </button>
                        <button
                            onClick={handleZoomReset}
                            className="upload-modal-zoom-ctrl-btn"
                        >
                            <RotateCcw />
                        </button>
                    </div>

                    {/* Zoomable image */}
                    <div className="upload-modal-zoom-image-container">
                        <img
                            src={imageUrl}
                            alt="Receipt zoomed"
                            style={{
                                width: `${zoomLevel * 100}%`,
                                maxWidth: `${zoomLevel * 100}%`,
                                height: 'auto'
                            }}
                            className="upload-modal-zoom-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default UploadModal;
