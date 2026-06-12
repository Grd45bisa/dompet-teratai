import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { X, Edit2, Trash2, Download, ZoomIn, Check, FileText } from 'lucide-react';
import { expensesApi, Expense } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { ExpenseForm } from '../dashboard/ExpenseForm';

interface TransactionDetailModalProps {
    expense: Expense | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function TransactionDetailModal({
    expense,
    isOpen,
    onClose,
    onUpdate,
}: TransactionDetailModalProps) {
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const [detailExpense, setDetailExpense] = useState<Expense | null>(expense);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        setDetailExpense(expense);
    }, [expense]);

    useEffect(() => {
        if (!isOpen || !expense || expense.attachment_type !== 'pdf' || expense.attachment_data) {
            return;
        }

        let active = true;
        setIsDetailLoading(true);

        void expensesApi.getExpense(expense.id)
            .then((result) => {
                if (active && result.success && result.data) {
                    setDetailExpense(result.data);
                }
            })
            .finally(() => {
                if (active) {
                    setIsDetailLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [expense, isOpen]);

    const currentExpense = detailExpense || expense;

    if (!isOpen || !currentExpense) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await expensesApi.deleteExpense(currentExpense.id);

            if (!result.success) throw new Error(result.error);

            showToast('success', 'Transaksi berhasil dihapus');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error deleting expense:', error);
            showToast('error', 'Gagal menghapus transaksi');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDownloadReceipt = async () => {
        // Handle PDF download
        if (currentExpense.attachment_type === 'pdf' && currentExpense.attachment_data) {
            try {
                // Convert base64 to blob
                const base64Data = currentExpense.attachment_data.split(',')[1] || currentExpense.attachment_data;
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                // Generate filename
                const dateStr = format(new Date(currentExpense.expense_date), 'yyyy-MM-dd');
                const categoryName = currentExpense.category?.name || 'invoice';
                link.download = `invoice_${categoryName}_${dateStr}.pdf`;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Cleanup
                window.URL.revokeObjectURL(url);
                showToast('success', 'PDF berhasil didownload');
            } catch (error) {
                console.error('Error downloading PDF:', error);
                showToast('error', 'Gagal mendownload PDF');
            }
            return;
        }

        // Handle image download
        if (!currentExpense.receipt_url) return;

        try {
            // Fetch the image
            const response = await fetch(currentExpense.receipt_url);
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename from date and category
            const dateStr = format(new Date(currentExpense.expense_date), 'yyyy-MM-dd');
            const categoryName = currentExpense.category?.name || 'receipt';
            const extension = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
            link.download = `struk_${categoryName}_${dateStr}.${extension}`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            window.URL.revokeObjectURL(url);
            showToast('success', 'Struk berhasil didownload');
        } catch (error) {
            console.error('Error downloading receipt:', error);
            showToast('error', 'Gagal mendownload struk');
        }
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        onUpdate();
        showToast('success', 'Transaksi berhasil diperbarui');
    };

    // Check if expense has any attachment
    const hasAttachment = currentExpense.receipt_url || (currentExpense.attachment_type === 'pdf' && currentExpense.attachment_data);

    return (
        <div className="tdm-overlay">
            {/* Overlay */}
            <div
                className="tdm-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="tdm-modal">
                {/* Header */}
                <div className="tdm-header">
                    <h2 className="tdm-title">
                        {isEditing ? 'Edit Transaksi' : 'Detail Transaksi'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="tdm-close-btn"
                    >
                        <X className="tdm-icon-sm" />
                    </button>
                </div>

                {/* Content */}
                <div className="tdm-content">
                    {isEditing ? (
                        <div className="tdm-form-wrapper">
                            <ExpenseForm
                                receiptUrl={currentExpense.receipt_url}
                                initialData={{
                                    category_id: currentExpense.category_id || '',
                                    amount: currentExpense.amount,
                                    expense_date: currentExpense.expense_date,
                                    description: currentExpense.description || '',
                                }}
                                expenseId={currentExpense.id}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setIsEditing(false)}
                            />
                        </div>
                    ) : (
                        <div className="tdm-details">
                            {/* Receipt Image */}
                            {currentExpense.receipt_url && (
                                <div
                                    className="tdm-receipt-container"
                                    onClick={() => setIsZoomed(true)}
                                >
                                    <img
                                        src={currentExpense.receipt_url}
                                        alt="Receipt"
                                        className="tdm-receipt-img"
                                    />
                                    <div className="tdm-receipt-overlay">
                                        <ZoomIn className="tdm-icon-lg" />
                                    </div>
                                </div>
                            )}

                            {/* PDF Indicator - Clickable */}
                            {currentExpense.attachment_type === 'pdf' && currentExpense.attachment_data && (
                                <div
                                    className="tdm-pdf-container tdm-pdf-clickable"
                                    onClick={() => setShowPdfViewer(true)}
                                >
                                    <FileText className="tdm-pdf-icon" />
                                    <span className="tdm-pdf-label">{isDetailLoading ? 'Memuat PDF...' : 'Klik untuk lihat PDF'}</span>
                                </div>
                            )}

                            {/* Details */}
                            <div className="tdm-detail-list">
                                {/* Category */}
                                <div className="tdm-detail-row">
                                    <span className="tdm-detail-label">Kategori</span>
                                    <span
                                        className="tdm-category-badge"
                                        style={{
                                            backgroundColor: `${currentExpense.category?.color || '#43A047'}20`,
                                            color: currentExpense.category?.color || '#43A047',
                                        }}
                                    >
                                        {currentExpense.category?.name || 'Lainnya'}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="tdm-detail-row">
                                    <span className="tdm-detail-label">Jumlah</span>
                                    <span className="tdm-amount">
                                        - {formatCurrency(currentExpense.amount)}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="tdm-detail-row">
                                    <span className="tdm-detail-label">Tanggal</span>
                                    <span className="tdm-detail-value">
                                        {format(new Date(currentExpense.expense_date), 'EEEE, dd MMMM yyyy', { locale: id })}
                                    </span>
                                </div>

                                {/* Description */}
                                {currentExpense.description && (
                                    <div className="tdm-detail-col">
                                        <span className="tdm-detail-label">Catatan</span>
                                        <span className="tdm-detail-value">
                                            {currentExpense.description}
                                        </span>
                                    </div>
                                )}

                                {/* AI Status */}
                                {currentExpense.ai_processed && (
                                    <div className="tdm-ai-badge">
                                        <Check className="tdm-ai-icon" />
                                        <span className="tdm-ai-text">
                                            Diproses AI
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isEditing && (
                    <div className="tdm-actions">
                        {hasAttachment && (
                            <button
                                onClick={handleDownloadReceipt}
                                className="tdm-btn-secondary"
                            >
                                <Download className="tdm-icon-sm" />
                                Download
                            </button>
                        )}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="tdm-btn-primary"
                        >
                            <Edit2 className="tdm-icon-sm" />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="tdm-btn-delete"
                        >
                            <Trash2 className="tdm-icon-sm" />
                        </button>
                    </div>
                )}
            </div>

            {/* Zoom Modal */}
            {isZoomed && currentExpense.receipt_url && (
                <div
                    className="tdm-zoom-overlay"
                    onClick={() => setIsZoomed(false)}
                >
                    <button
                        className="tdm-zoom-close"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X className="tdm-icon-md" />
                    </button>
                    <img
                        src={currentExpense.receipt_url}
                        alt="Receipt"
                        className="tdm-zoom-img"
                    />
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="tdm-confirm-overlay">
                    <div className="tdm-confirm-backdrop" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="tdm-confirm-modal">
                        <h3 className="tdm-confirm-title">
                            Hapus Transaksi?
                        </h3>
                        <p className="tdm-confirm-text">
                            Transaksi yang sudah dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="tdm-confirm-actions">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="tdm-btn-cancel"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="tdm-btn-confirm-delete"
                            >
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showPdfViewer && currentExpense.attachment_type === 'pdf' && currentExpense.attachment_data && (
                <div className="tdm-zoom-overlay">
                    <button
                        className="tdm-zoom-close"
                        onClick={() => setShowPdfViewer(false)}
                    >
                        <X className="tdm-icon-md" />
                    </button>
                    <div className="tdm-pdf-viewer">
                        <iframe
                            src={currentExpense.attachment_data}
                            title="PDF Viewer"
                            className="tdm-pdf-iframe"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransactionDetailModal;
