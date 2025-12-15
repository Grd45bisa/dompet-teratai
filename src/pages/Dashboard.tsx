import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Wallet,
    ShoppingBag,
    Tag,
    AlertTriangle,
    TrendingUp,
    Sparkles,
    ArrowRight,
    PiggyBank,
    Target,
    CalendarDays,
    BarChart3,
    Clock,
    Sun,
    Sunset,
    Moon,
    CloudSun
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { Link } from 'react-router-dom';
import { expensesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatCurrency';
import { useSocketEvent, SocketEvents } from '../contexts/SocketContext';
import type { Expense } from '../types';

interface DailyData {
    date: string;
    total: number;
}

// Get greeting based on time
function getGreeting(): { text: string; icon: React.ReactNode } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Selamat Pagi', icon: <Sun className="dashboard-greeting-icon dashboard-greeting-icon-morning" /> };
    if (hour < 15) return { text: 'Selamat Siang', icon: <CloudSun className="dashboard-greeting-icon dashboard-greeting-icon-noon" /> };
    if (hour < 18) return { text: 'Selamat Sore', icon: <Sunset className="dashboard-greeting-icon dashboard-greeting-icon-afternoon" /> };
    return { text: 'Selamat Malam', icon: <Moon className="dashboard-greeting-icon dashboard-greeting-icon-night" /> };
}

// Budget Progress Card
const BudgetProgressCard = memo(({
    spent,
    budget,
}: {
    spent: number;
    budget: number;
}) => {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - spent, 0);
    const isOverBudget = spent > budget;

    // Status
    const getStatus = () => {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'safe';
    };

    const status = getStatus();

    const statusConfig = {
        safe: {
            progressColor: 'dashboard-budget-progress-safe',
            badgeClass: 'dashboard-budget-badge-safe',
            message: 'Keuanganmu terkontrol dengan baik',
            icon: <TrendingUp className="dashboard-budget-badge-icon" />,
        },
        warning: {
            progressColor: 'dashboard-budget-progress-warning',
            badgeClass: 'dashboard-budget-badge-warning',
            message: 'Hati-hati, budget hampir habis',
            icon: <AlertTriangle className="dashboard-budget-badge-icon" />,
        },
        danger: {
            progressColor: 'dashboard-budget-progress-danger',
            badgeClass: 'dashboard-budget-badge-danger',
            message: 'Budget sudah terlampaui',
            icon: <AlertTriangle className="dashboard-budget-badge-icon" />,
        },
    };

    const config = statusConfig[status];

    return (
        <div className="dashboard-card">
            <div className="dashboard-budget-header">
                <div className="dashboard-budget-title-section">
                    <div className="dashboard-icon-wrapper dashboard-icon-wrapper-primary">
                        <Target className="dashboard-icon" />
                    </div>
                    <div>
                        <h3 className="dashboard-card-title">
                            Budget Bulanan
                        </h3>
                        <p className="dashboard-card-subtitle">
                            {format(new Date(), 'MMMM yyyy', { locale: id })}
                        </p>
                    </div>
                </div>
                <div className={`dashboard-budget-badge ${config.badgeClass}`}>
                    {config.icon}
                    {percentage.toFixed(0)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="dashboard-budget-progress-container">
                <div className="dashboard-budget-progress-bar">
                    <div
                        className={`dashboard-budget-progress-fill ${config.progressColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="dashboard-budget-stats">
                <div className="dashboard-budget-stat-item">
                    <p className="dashboard-budget-stat-label">Terpakai</p>
                    <p className="dashboard-budget-stat-value">
                        {formatCompactCurrency(spent)}
                    </p>
                </div>
                <div className="dashboard-budget-stat-item">
                    <p className="dashboard-budget-stat-label">Sisa Budget</p>
                    <p className={`dashboard-budget-stat-value ${isOverBudget ? 'dashboard-budget-stat-value-danger' : 'dashboard-budget-stat-value-primary'}`}>
                        {formatCompactCurrency(remaining)}
                    </p>
                </div>
            </div>

            {/* Status Message */}
            <p className={`dashboard-budget-message ${config.badgeClass}`}>
                {config.icon}
                {config.message}
            </p>
        </div>
    );
});

BudgetProgressCard.displayName = 'BudgetProgressCard';

// Stat Card
const StatCard = memo(({
    title,
    value,
    icon,
    iconColorClass,
    fullWidth,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconColorClass: string;
    fullWidth?: boolean;
}) => (
    <div className={`dashboard-stat-card ${fullWidth ? 'dashboard-stat-card-full' : ''}`}>
        <div className="dashboard-stat-content">
            <div className={`dashboard-icon-wrapper ${iconColorClass}`}>
                {icon}
            </div>
            <div className="dashboard-stat-info">
                <p className="dashboard-stat-label">{title}</p>
                <p className="dashboard-stat-value">{value}</p>
            </div>
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

// Transaction item
const TransactionItem = memo(({ expense }: { expense: Expense }) => (
    <div className="dashboard-transaction-item">
        <div
            className="dashboard-transaction-icon"
            style={{ backgroundColor: `${expense.category?.color || '#43A047'}15` }}
        >
            <div
                className="dashboard-transaction-color"
                style={{ backgroundColor: expense.category?.color || '#43A047' }}
            />
        </div>
        <div className="dashboard-transaction-info">
            <p className="dashboard-transaction-desc">
                {expense.description || expense.category?.name || 'Pengeluaran'}
            </p>
            <p className="dashboard-transaction-meta">
                {expense.category?.name} • {format(new Date(expense.expense_date), 'dd MMM', { locale: id })}
            </p>
        </div>
        <p className="dashboard-transaction-amount">
            -{formatCompactCurrency(expense.amount)}
        </p>
    </div>
));

TransactionItem.displayName = 'TransactionItem';

// Skeleton loader
function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton">
            <div className="dashboard-skeleton-item dashboard-skeleton-header" />
            <div className="dashboard-skeleton-item dashboard-skeleton-budget" />
            <div className="dashboard-skeleton-stats">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="dashboard-skeleton-item dashboard-skeleton-stat" />
                ))}
            </div>
            <div className="dashboard-skeleton-item dashboard-skeleton-chart" />
        </div>
    );
}

export function Dashboard() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cacheKey = user ? `expenses_cache_${user.id}` : null;
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (isDemoMode) {
            try {
                const demoExpenses = JSON.parse(localStorage.getItem('demo_expenses') || '[]');
                setExpenses(demoExpenses);
            } catch (e) {
                console.error('Error loading demo data');
            }
            setIsLoading(false);
            return;
        }

        if (!user || !cacheKey) return;

        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());

        const result = await expensesApi.getExpenses({
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(monthEnd, 'yyyy-MM-dd'),
        });

        if (result.success && result.data) {
            setExpenses(result.data as Expense[]);
            localStorage.setItem(cacheKey, JSON.stringify({
                data: result.data,
                timestamp: Date.now(),
            }));
        }

        setIsLoading(false);
    }, [user, cacheKey, isDemoMode]);

    // Initial data load with cache
    useEffect(() => {
        if (isDemoMode) {
            fetchData();
            return;
        }

        if (!user || !cacheKey) return;

        // Try cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    setExpenses(data);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error('Cache parse error');
            }
        }

        fetchData();
    }, [user, cacheKey, isDemoMode, fetchData]);

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

    // Stats calculation
    const stats = useMemo(() => {
        const totalMonth = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const transactionCount = expenses.length;
        const avgPerTransaction = transactionCount > 0 ? totalMonth / transactionCount : 0;

        const categoryTotals: Record<string, { name: string; total: number; color: string }> = {};
        expenses.forEach((expense) => {
            const catId = expense.category_id || 'other';
            const catName = expense.category?.name || 'Lainnya';
            const catColor = expense.category?.color || '#43A047';
            if (!categoryTotals[catId]) {
                categoryTotals[catId] = { name: catName, total: 0, color: catColor };
            }
            categoryTotals[catId].total += Number(expense.amount);
        });

        const topCategory = Object.values(categoryTotals).sort((a, b) => b.total - a.total)[0];

        return {
            totalMonth,
            transactionCount,
            avgPerTransaction,
            topCategory,
        };
    }, [expenses]);

    // Chart data
    const chartData = useMemo((): DailyData[] => {
        const data: DailyData[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTotal = expenses
                .filter((e) => e.expense_date === dateStr)
                .reduce((sum, e) => sum + Number(e.amount), 0);

            data.push({
                date: format(date, 'EEE', { locale: id }),
                total: dayTotal,
            });
        }

        return data;
    }, [expenses]);

    const recentTransactions = useMemo(() => expenses.slice(0, 5), [expenses]);

    if (isLoading && expenses.length === 0) {
        return <DashboardSkeleton />;
    }

    const userName = user?.full_name?.split(' ')[0] || 'User';
    const monthlyBudget = user?.monthly_budget || 500000;
    const greeting = getGreeting();

    return (
        <div className="dashboard-container">
            {/* Greeting Header */}
            <div className="dashboard-card">
                <div className="dashboard-greeting-header">
                    <div>
                        <div className="dashboard-greeting-text">
                            {greeting.icon}
                            <span>{greeting.text}</span>
                        </div>
                        <h1 className="dashboard-greeting-name">
                            Hai, {userName}!
                        </h1>
                        <div className="dashboard-greeting-date">
                            <CalendarDays className="dashboard-greeting-date-icon" />
                            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                        </div>
                    </div>
                    {user?.avatar_url && (
                        <img
                            src={user.avatar_url}
                            alt="Avatar"
                            className="dashboard-greeting-avatar"
                        />
                    )}
                </div>
            </div>

            {/* Budget Progress Card */}
            <BudgetProgressCard
                spent={stats.totalMonth}
                budget={monthlyBudget}
            />

            {/* Quick Stats - Responsive Grid */}
            <div className="dashboard-stats-section">
                {/* Average - Full Width on Mobile */}
                <StatCard
                    title="Rata-rata Transaksi"
                    value={formatCompactCurrency(stats.avgPerTransaction)}
                    icon={<Wallet className="dashboard-icon dashboard-icon-purple" />}
                    iconColorClass="dashboard-icon-wrapper-purple"
                    fullWidth
                />
                {/* Two columns below */}
                <div className="dashboard-stats-grid">
                    <StatCard
                        title="Transaksi"
                        value={`${stats.transactionCount} kali`}
                        icon={<ShoppingBag className="dashboard-icon dashboard-icon-blue" />}
                        iconColorClass="dashboard-icon-wrapper-blue"
                    />
                    <StatCard
                        title="Terbanyak"
                        value={stats.topCategory?.name || '-'}
                        icon={<Tag className="dashboard-icon dashboard-icon-orange" />}
                        iconColorClass="dashboard-icon-wrapper-orange"
                    />
                </div>
            </div>

            {/* Chart Section */}
            <div className="dashboard-card">
                <div className="dashboard-section-header">
                    <div className="dashboard-icon-wrapper dashboard-icon-wrapper-primary">
                        <BarChart3 className="dashboard-icon" />
                    </div>
                    <div>
                        <h2 className="dashboard-card-title">
                            Grafik 7 Hari Terakhir
                        </h2>
                        <p className="dashboard-card-subtitle">Visualisasi pengeluaran harian</p>
                    </div>
                </div>
                <div className="dashboard-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#43A047" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#43A047" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                axisLine={false}
                                tickLine={false}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderColor: '#e5e7eb',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                formatter={(value: number) => [`Rp ${formatCurrency(value)}`, 'Total']}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#43A047"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="dashboard-card dashboard-card-no-padding">
                <div className="dashboard-transactions-header">
                    <div className="dashboard-section-header">
                        <div className="dashboard-icon-wrapper dashboard-icon-wrapper-primary">
                            <Clock className="dashboard-icon" />
                        </div>
                        <div>
                            <h2 className="dashboard-card-title">
                                Transaksi Terakhir
                            </h2>
                            <p className="dashboard-card-subtitle">5 pengeluaran terbaru</p>
                        </div>
                    </div>
                    <Link
                        to="/transactions"
                        className="dashboard-transactions-link"
                    >
                        Lihat Semua
                        <ArrowRight className="dashboard-transactions-link-icon" />
                    </Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="dashboard-empty-icon-wrapper">
                            <PiggyBank className="dashboard-empty-icon" />
                        </div>
                        <h3 className="dashboard-empty-title">
                            Belum Ada Transaksi
                        </h3>
                        <p className="dashboard-empty-text">
                            Mulai catat pengeluaranmu dengan menekan tombol + di bawah
                        </p>
                        <div className="dashboard-empty-tip">
                            <Sparkles className="dashboard-empty-tip-icon" />
                            Tips: Foto struk untuk input otomatis!
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-transactions-list">
                        {recentTransactions.map((expense) => (
                            <TransactionItem key={expense.id} expense={expense} />
                        ))}
                    </div>
                )}
            </div>

            {/* Help for New Users */}
            {expenses.length === 0 && (
                <div className="dashboard-card">
                    <div className="dashboard-section-header">
                        <div className="dashboard-icon-wrapper dashboard-icon-wrapper-primary">
                            <Sparkles className="dashboard-icon" />
                        </div>
                        <h3 className="dashboard-card-title">
                            Cara Menggunakan
                        </h3>
                    </div>
                    <ul className="dashboard-help-list">
                        <li className="dashboard-help-item">
                            <span className="dashboard-help-number">1</span>
                            <span>Tekan tombol <strong className="text-primary">+</strong> untuk tambah pengeluaran</span>
                        </li>
                        <li className="dashboard-help-item">
                            <span className="dashboard-help-number">2</span>
                            <span>Foto struk untuk input otomatis dengan AI</span>
                        </li>
                        <li className="dashboard-help-item">
                            <span className="dashboard-help-number">3</span>
                            <span>Pantau budget bulananmu di kartu di atas</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
