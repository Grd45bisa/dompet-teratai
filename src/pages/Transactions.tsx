import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { format, isToday, isYesterday, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Filter, Receipt, Trash2, Image, Calendar, ChevronRight, X, FileText } from 'lucide-react';
import { expensesApi, categoriesApi, Expense, Category } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSocketEvent, SocketEvents } from '../contexts/SocketContext';
import { formatCurrency } from '../utils/formatCurrency';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { AIProcessingCard } from '../components/dashboard/AIProcessingCard';

interface GroupedExpenses {
    [date: string]: Expense[];
}

// Skeleton loader
function TransactionsSkeleton() {
    return (
        <div className="trans-skeleton">
            <div className="trans-skeleton-header">
                <div className="trans-skeleton-item trans-skeleton-title" />
                <div className="trans-skeleton-item trans-skeleton-btn" />
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="trans-skeleton-group">
                    <div className="trans-skeleton-item trans-skeleton-date" />
                    <div className="trans-skeleton-item trans-skeleton-card" />
                </div>
            ))}
        </div>
    );
}

// Modern expense item - cleaner design
const ExpenseItem = memo(({
    expense,
    onClick,
    onDelete,
}: {
    expense: Expense;
    onClick: () => void;
    onDelete: () => void;
}) => (
    <div
        onClick={onClick}
        className="trans-item"
    >
        {/* Category Icon/Receipt/PDF */}
        {expense.attachment_type === 'pdf' ? (
            <div className="trans-item-pdf">
                <FileText className="trans-item-pdf-icon" />
            </div>
        ) : expense.receipt_url ? (
            <div className="trans-item-receipt">
                <img
                    src={expense.receipt_url}
                    alt="Receipt"
                    className="trans-item-receipt-img"
                    loading="lazy"
                />
            </div>
        ) : (
            <div
                className="trans-item-icon"
                style={{ backgroundColor: `${expense.category?.color || '#43A047'}15` }}
            >
                <div
                    className="trans-item-color"
                    style={{ backgroundColor: expense.category?.color || '#43A047' }}
                />
            </div>
        )}

        {/* Main Content */}
        <div className="trans-item-content">
            <p className="trans-item-desc">
                {expense.description || 'Pengeluaran'}
            </p>
            <div className="trans-item-meta">
                <span
                    className="trans-item-category"
                    style={{
                        backgroundColor: `${expense.category?.color || '#43A047'}15`,
                        color: expense.category?.color || '#43A047',
                    }}
                >
                    {expense.category?.name || 'Lainnya'}
                </span>
                {expense.attachment_type === 'pdf' ? (
                    <FileText className="trans-item-image-icon" />
                ) : expense.receipt_url && (
                    <Image className="trans-item-image-icon" />
                )}
            </div>
        </div>

        {/* Amount & Actions */}
        <div className="trans-item-right">
            <div className="trans-item-amount-section">
                <p className="trans-item-amount">
                    -{formatCurrency(expense.amount)}
                </p>
                <p className="trans-item-time">
                    {format(new Date(expense.created_at), 'HH:mm', { locale: id })}
                </p>
            </div>

            {/* Delete button - visible on hover (desktop) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="trans-item-delete"
            >
                <Trash2 className="trans-item-delete-icon" />
            </button>

            {/* Chevron for mobile */}
            <ChevronRight className="trans-item-chevron" />
        </div>
    </div>
));

ExpenseItem.displayName = 'ExpenseItem';

export function Transactions() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Cache key
    const cacheKey = user ? `transactions_${user.id}_${dateFrom}_${dateTo}` : null;

    const fetchData = useCallback(async () => {
        if (!user) return;

        // Try cache first
        if (cacheKey) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < 2 * 60 * 1000) {
                        setExpenses(data);
                        setIsLoading(false);
                    }
                } catch (e) { }
            }
        }

        // Fetch from backend API
        const result = await expensesApi.getExpenses({
            from: dateFrom,
            to: dateTo,
            category_id: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        });

        if (result.success && result.data) {
            let filteredData = result.data;
            if (selectedCategories.length > 1) {
                filteredData = result.data.filter(e =>
                    selectedCategories.includes(e.category_id || '')
                );
            }
            setExpenses(filteredData as Expense[]);
            if (cacheKey) {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: filteredData,
                    timestamp: Date.now(),
                }));
            }
        }

        // Fetch categories
        const catCacheKey = `categories_${user.id}`;
        const catCached = localStorage.getItem(catCacheKey);

        if (catCached) {
            try {
                const { data: cachedCats, timestamp } = JSON.parse(catCached);
                if (Date.now() - timestamp < 10 * 60 * 1000) {
                    setCategories(cachedCats);
                }
            } catch (e) { }
        }

        const catResult = await categoriesApi.getCategories();
        if (catResult.success && catResult.data) {
            setCategories(catResult.data as Category[]);
            localStorage.setItem(catCacheKey, JSON.stringify({
                data: catResult.data,
                timestamp: Date.now(),
            }));
        }

        setIsLoading(false);
    }, [user, dateFrom, dateTo, selectedCategories, cacheKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // WebSocket event listeners for real-time updates
    useSocketEvent(SocketEvents.EXPENSE_CREATED, useCallback(() => {
        console.log('📥 New expense received via WebSocket');
        fetchData();
    }, [fetchData]));

    useSocketEvent(SocketEvents.EXPENSE_UPDATED, useCallback(() => {
        console.log('📝 Expense updated via WebSocket');
        fetchData();
    }, [fetchData]));

    useSocketEvent(SocketEvents.EXPENSE_DELETED, useCallback(() => {
        console.log('🗑️ Expense deleted via WebSocket');
        fetchData();
    }, [fetchData]));

    useSocketEvent(SocketEvents.CATEGORY_CREATED, useCallback(() => {
        console.log('📁 Category created via WebSocket');
        fetchData();
    }, [fetchData]));

    useSocketEvent(SocketEvents.CATEGORY_UPDATED, useCallback(() => {
        console.log('📁 Category updated via WebSocket');
        fetchData();
    }, [fetchData]));

    useSocketEvent(SocketEvents.CATEGORY_DELETED, useCallback(() => {
        console.log('📁 Category deleted via WebSocket');
        fetchData();
    }, [fetchData]));

    // Group by date
    const groupedExpenses = useMemo((): GroupedExpenses => {
        const groups: GroupedExpenses = {};
        const sorted = [...expenses].sort(
            (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
        );
        sorted.forEach((expense) => {
            const date = expense.expense_date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(expense);
        });
        return groups;
    }, [expenses]);

    // Date totals
    const dateTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.entries(groupedExpenses).forEach(([date, exps]) => {
            totals[date] = exps.reduce((sum, e) => sum + Number(e.amount), 0);
        });
        return totals;
    }, [groupedExpenses]);

    // Format date header
    const formatDateHeader = useCallback((dateStr: string): string => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Hari Ini';
        if (isYesterday(date)) return 'Kemarin';
        return format(date, 'EEEE, dd MMMM yyyy', { locale: id });
    }, []);

    // Handle delete
    const handleDelete = useCallback(async (id: string) => {
        const confirmed = window.confirm('Hapus transaksi ini?');
        if (!confirmed) return;

        const result = await expensesApi.deleteExpense(id);
        if (result.success) {
            showToast('success', 'Transaksi dihapus');
            fetchData();
        } else {
            showToast('error', 'Gagal menghapus transaksi');
        }
    }, [fetchData, showToast]);

    const resetFilters = useCallback(() => {
        setDateFrom(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
        setDateTo(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
        setSelectedCategories([]);
    }, []);

    const toggleCategory = useCallback((catId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(catId)
                ? prev.filter((id) => id !== catId)
                : [...prev, catId]
        );
    }, []);

    // Total for period
    const periodTotal = useMemo(() => {
        return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    }, [expenses]);

    if (isLoading && expenses.length === 0) {
        return <TransactionsSkeleton />;
    }

    return (
        <div className="trans-container">
            {/* Header */}
            <div className="trans-header">
                <div>
                    <h1 className="trans-title">
                        Transaksi
                    </h1>
                    <p className="trans-subtitle">
                        {format(new Date(dateFrom), 'dd MMM', { locale: id })} - {format(new Date(dateTo), 'dd MMM yyyy', { locale: id })}
                    </p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`trans-filter-btn ${showFilters ? 'trans-filter-btn-active' : ''}`}
                >
                    <Filter className="trans-filter-icon" />
                    {selectedCategories.length > 0 && (
                        <span className="trans-filter-count">{selectedCategories.length}</span>
                    )}
                </button>
            </div>

            <AIProcessingCard />

            {/* Summary Card */}
            <div className="trans-summary-card">
                <div className="trans-summary-content">
                    <div>
                        <p className="trans-summary-label">Total Periode Ini</p>
                        <p className="trans-summary-value">
                            {formatCurrency(periodTotal)}
                        </p>
                    </div>
                    <div className="trans-summary-count">
                        <p className="trans-summary-label">{expenses.length} transaksi</p>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="trans-filter-panel">
                    <div className="trans-filter-header">
                        <h3 className="trans-filter-title">Filter</h3>
                        <button onClick={() => setShowFilters(false)} className="trans-filter-close">
                            <X className="trans-filter-close-icon" />
                        </button>
                    </div>

                    <div className="trans-filter-dates">
                        <div className="trans-filter-date-group">
                            <label className="trans-filter-label">
                                Dari Tanggal
                            </label>
                            <div className="trans-filter-input-wrapper">
                                <Calendar className="trans-filter-input-icon" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="trans-filter-input"
                                />
                            </div>
                        </div>
                        <div className="trans-filter-date-group">
                            <label className="trans-filter-label">
                                Sampai Tanggal
                            </label>
                            <div className="trans-filter-input-wrapper">
                                <Calendar className="trans-filter-input-icon" />
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="trans-filter-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="trans-filter-categories">
                        <label className="trans-filter-label">
                            Kategori
                        </label>
                        <div className="trans-filter-category-list">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`trans-filter-category-btn ${selectedCategories.includes(cat.id) ? 'trans-filter-category-btn-active' : ''}`}
                                    style={{
                                        backgroundColor: selectedCategories.includes(cat.id) ? cat.color : undefined,
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="trans-filter-actions">
                        <button
                            onClick={resetFilters}
                            className="trans-filter-reset-btn"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="trans-filter-apply-btn"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction List */}
            {Object.keys(groupedExpenses).length === 0 ? (
                <div className="trans-empty">
                    <div className="trans-empty-icon-wrapper">
                        <Receipt className="trans-empty-icon" />
                    </div>
                    <p className="trans-empty-title">
                        Belum ada transaksi
                    </p>
                    <p className="trans-empty-text">
                        Transaksi yang Anda buat akan muncul di sini
                    </p>
                </div>
            ) : (
                <div className="trans-list">
                    {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                        <div key={date} className="trans-group">
                            {/* Date Header */}
                            <div className="trans-date-header">
                                <h3 className="trans-date-title">
                                    {formatDateHeader(date)}
                                </h3>
                                <span className="trans-date-total">
                                    -{formatCurrency(dateTotals[date] || 0)}
                                </span>
                            </div>

                            {/* Transactions Card */}
                            <div className="trans-date-card">
                                {dateExpenses.map((expense) => (
                                    <ExpenseItem
                                        key={expense.id}
                                        expense={expense}
                                        onClick={() => {
                                            setSelectedExpense(expense);
                                            setShowDetailModal(true);
                                        }}
                                        onDelete={() => handleDelete(expense.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TransactionDetailModal
                expense={selectedExpense}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedExpense(null);
                }}
                onUpdate={fetchData}
            />
        </div>
    );
}

export default Transactions;
