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
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative w-full md:max-w-4xl bg-darkCard rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-200 max-h-[95vh] md:max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white">Add New Expense</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable on mobile */}
                    <div className="flex flex-col md:flex-row max-h-[calc(95vh-60px)] md:max-h-[calc(90vh-72px)] overflow-y-auto md:overflow-visible">
                        {/* Left - Upload Area */}
                        <div className="w-full md:w-2/5 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-800">
                            <div
                                ref={dropZoneRef}
                                onClick={() => !imageUrl && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    relative rounded-xl border-2 border-dashed cursor-pointer
                                    flex flex-col items-center justify-center gap-2 transition-all overflow-hidden
                                    h-50 md:aspect-square
                                    ${isDragging
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-700 hover:border-primary hover:bg-gray-800/50'
                                    }
                                    ${imageUrl ? 'border-solid border-primary' : ''}
                                `}
                            >
                                {isCompressing ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-sm text-gray-400">Processing...</p>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt="Receipt"
                                            className="w-full h-full object-contain"
                                        />
                                        {/* Zoom button overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowZoomModal(true);
                                            }}
                                            className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-lg text-white hover:bg-black/90 transition-colors"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                        {/* Change image button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-black/70 rounded-lg text-white hover:bg-black/90 transition-colors text-xs"
                                        >
                                            Change
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Camera className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                        </div>
                                        <div className="text-center px-2">
                                            <p className="text-sm font-medium text-white">Upload Receipt</p>
                                            <p className="text-xs text-gray-400 hidden md:block">Click or drag file here</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] md:text-xs text-gray-400">
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
                                className="hidden"
                            />

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!imageUrl || isAnalyzing}
                                className={`
                                    w-full mt-3 md:mt-4 py-2.5 md:py-3 rounded-xl font-medium flex items-center justify-center gap-2
                                    transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base
                                    ${imageUrl
                                        ? 'bg-gradient-to-r from-primary to-teal-400 text-white hover:opacity-90'
                                        : 'bg-gray-800 text-gray-400'
                                    }
                                `}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                        Analyze Receipt
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Right - Form */}
                        <div className="w-full md:w-3/5 p-4 md:p-6 space-y-3 md:space-y-4 md:max-h-[70vh] md:overflow-y-auto">
                            {/* Store Name */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Store Name *
                                </label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="e.g. BreadTalk, Walmart"
                                    className="w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary appearance-none"
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
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Amount (Rp) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm font-medium">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatDisplayAmount(amount)}
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="w-full pl-10 pr-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    className="w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Store Address - Hidden on mobile for less clutter */}
                            <div className="hidden md:block">
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Store Address
                                </label>
                                <input
                                    type="text"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    placeholder="e.g. Main Street Mall"
                                    className="w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Optional notes..."
                                    className="w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2 pb-4 md:pb-0">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 md:py-3 rounded-lg bg-gray-700 text-white text-sm md:text-base font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !categoryId || !amount}
                                    className="flex-1 py-2.5 md:py-3 rounded-lg bg-primary text-white text-sm md:text-base font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
                    {/* Close button */}
                    <button
                        onClick={() => setShowZoomModal(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Zoom controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-xl p-2 z-10">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white text-sm min-w-[60px] text-center">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleZoomReset}
                            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Zoomable image */}
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-8">
                        <img
                            src={imageUrl}
                            alt="Receipt zoomed"
                            style={{
                                width: `${zoomLevel * 100}%`,
                                maxWidth: `${zoomLevel * 100}%`,
                                height: 'auto'
                            }}
                            className="transition-all duration-200 object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default UploadModal;
