import { useState, useEffect, useMemo } from 'react';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    eachDayOfInterval,
    eachMonthOfInterval,
} from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Wallet,
    Calendar,
    TrendingUp,
    TrendingDown,
    Download,
    FileSpreadsheet,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { expensesApi, Expense } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatCurrency';
import { exportToExcel } from '../utils/exportExcel';
import { generatePDFReport } from '../utils/exportPDF';

type Period = 'week' | 'month' | 'year' | 'custom';

interface CategoryBreakdown {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

export function Reports() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState<Period>('month');
    const [customFrom, setCustomFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customTo, setCustomTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // Calculate date range based on period
    const dateRange = useMemo(() => {
        const today = new Date();
        switch (activePeriod) {
            case 'week':
                return {
                    from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    to: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    label: 'Minggu Ini',
                };
            case 'month':
                return {
                    from: format(startOfMonth(today), 'yyyy-MM-dd'),
                    to: format(endOfMonth(today), 'yyyy-MM-dd'),
                    label: 'Bulan Ini',
                };
            case 'year':
                return {
                    from: format(startOfYear(today), 'yyyy-MM-dd'),
                    to: format(endOfYear(today), 'yyyy-MM-dd'),
                    label: 'Tahun Ini',
                };
            case 'custom':
                return {
                    from: customFrom,
                    to: customTo,
                    label: `${format(new Date(customFrom), 'dd MMM', { locale: id })} - ${format(new Date(customTo), 'dd MMM yyyy', { locale: id })}`,
                };
        }
    }, [activePeriod, customFrom, customTo]);

    // Fetch expenses
    useEffect(() => {
        const fetchExpenses = async () => {
            if (!user) return;

            setIsLoading(true);

            const result = await expensesApi.getExpenses({
                from: dateRange.from,
                to: dateRange.to,
            });

            if (result.success && result.data) {
                setExpenses(result.data as Expense[]);
            }

            setIsLoading(false);
        };

        fetchExpenses();
    }, [user, dateRange]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const count = expenses.length;

        // Days in period
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const avgPerDay = days > 0 ? total / days : 0;

        // Highest & Lowest
        const sorted = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount));
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];

        return {
            total,
            count,
            avgPerDay,
            highest,
            lowest,
        };
    }, [expenses, dateRange]);

    // Category breakdown for pie chart
    const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
        const breakdown: Record<string, { name: string; value: number; color: string }> = {};

        expenses.forEach((expense) => {
            const catId = expense.category_id || 'other';
            const catName = expense.category?.name || 'Lainnya';
            const catColor = expense.category?.color || '#757575';

            if (!breakdown[catId]) {
                breakdown[catId] = { name: catName, value: 0, color: catColor };
            }
            breakdown[catId].value += Number(expense.amount);
        });

        const total = Object.values(breakdown).reduce((sum, c) => sum + c.value, 0);

        return Object.values(breakdown)
            .map((c) => ({
                ...c,
                percentage: total > 0 ? (c.value / total) * 100 : 0,
            }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    // Trend data for area chart
    const trendData = useMemo(() => {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);

        if (activePeriod === 'year') {
            // Monthly data for year view
            const months = eachMonthOfInterval({ start: from, end: to });
            return months.map((month) => {
                const monthStr = format(month, 'yyyy-MM');
                const monthTotal = expenses
                    .filter((e) => e.expense_date.startsWith(monthStr))
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    date: format(month, 'MMM', { locale: id }),
                    total: monthTotal,
                };
            });
        } else {
            // Daily data for week/month/custom
            const days = eachDayOfInterval({ start: from, end: to });
            return days.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayTotal = expenses
                    .filter((e) => e.expense_date === dayStr)
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    date: format(day, activePeriod === 'week' ? 'EEE' : 'dd', { locale: id }),
                    total: dayTotal,
                };
            });
        }
    }, [expenses, dateRange, activePeriod]);

    // Handle export
    const handleExportExcel = () => {
        exportToExcel({
            expenses,
            periodLabel: dateRange.label,
            dateFrom: dateRange.from,
            dateTo: dateRange.to,
        });
    };

    // Handle PDF export
    const handleExportPDF = async () => {
        await generatePDFReport({
            expenses,
            periodLabel: dateRange.label,
            totalAmount: stats.total,
            categoryBreakdown,
            userName: user?.full_name || '',
        });
    };

    const periods: { key: Period; label: string }[] = [
        { key: 'week', label: 'Minggu Ini' },
        { key: 'month', label: 'Bulan Ini' },
        { key: 'year', label: 'Tahun Ini' },
        { key: 'custom', label: 'Custom' },
    ];

    if (isLoading) {
        return (
            <div className="reports-loading">
                <div className="reports-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-header">
                <h1 className="reports-title">
                    Laporan
                </h1>
                <p className="reports-subtitle">
                    {dateRange.label}
                </p>
            </div>

            {/* Period Selector */}
            <div className="reports-period-selector">
                <div className="reports-period-buttons">
                    {periods.map((period) => (
                        <button
                            key={period.key}
                            onClick={() => setActivePeriod(period.key)}
                            className={`reports-period-btn ${activePeriod === period.key ? 'reports-period-btn-active' : ''}`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Range */}
                {activePeriod === 'custom' && (
                    <div className="reports-custom-dates">
                        <div className="reports-custom-date-group">
                            <label className="reports-custom-label">Dari</label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="reports-custom-input"
                            />
                        </div>
                        <div className="reports-custom-date-group">
                            <label className="reports-custom-label">Sampai</label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="reports-custom-input"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="reports-summary-grid">
                {/* Total */}
                <div className="reports-summary-card">
                    <div className="reports-summary-icon-row">
                        <Wallet className="reports-summary-icon reports-summary-icon-primary" />
                        <span className="reports-summary-label">Total</span>
                    </div>
                    <p className="reports-summary-value">
                        {formatCompactCurrency(stats.total)}
                    </p>
                </div>

                {/* Average */}
                <div className="reports-summary-card">
                    <div className="reports-summary-icon-row">
                        <Calendar className="reports-summary-icon reports-summary-icon-blue" />
                        <span className="reports-summary-label">Rata-rata/Hari</span>
                    </div>
                    <p className="reports-summary-value">
                        {formatCompactCurrency(stats.avgPerDay)}
                    </p>
                </div>

                {/* Highest */}
                <div className="reports-summary-card">
                    <div className="reports-summary-icon-row">
                        <TrendingUp className="reports-summary-icon reports-summary-icon-red" />
                        <span className="reports-summary-label">Tertinggi</span>
                    </div>
                    <p className="reports-summary-value">
                        {stats.highest ? formatCompactCurrency(Number(stats.highest.amount)) : '-'}
                    </p>
                    {stats.highest && (
                        <p className="reports-summary-date">
                            {format(new Date(stats.highest.expense_date), 'dd MMM', { locale: id })}
                        </p>
                    )}
                </div>

                {/* Lowest */}
                <div className="reports-summary-card">
                    <div className="reports-summary-icon-row">
                        <TrendingDown className="reports-summary-icon reports-summary-icon-green" />
                        <span className="reports-summary-label">Terendah</span>
                    </div>
                    <p className="reports-summary-value">
                        {stats.lowest ? formatCompactCurrency(Number(stats.lowest.amount)) : '-'}
                    </p>
                    {stats.lowest && (
                        <p className="reports-summary-date">
                            {format(new Date(stats.lowest.expense_date), 'dd MMM', { locale: id })}
                        </p>
                    )}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="reports-card">
                <h2 className="reports-card-title">
                    Pengeluaran per Kategori
                </h2>

                {categoryBreakdown.length === 0 ? (
                    <div className="reports-empty">
                        Tidak ada data untuk periode ini
                    </div>
                ) : (
                    <div className="reports-category-content">
                        {/* Pie Chart */}
                        <div className="reports-pie-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderColor: '#e5e7eb',
                                            borderRadius: '0.75rem',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="reports-legend">
                            {categoryBreakdown.slice(0, 6).map((cat) => (
                                <div key={cat.name} className="reports-legend-item">
                                    <div className="reports-legend-left">
                                        <div
                                            className="reports-legend-color"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="reports-legend-name">
                                            {cat.name}
                                        </span>
                                    </div>
                                    <div className="reports-legend-right">
                                        <span className="reports-legend-value">
                                            {formatCompactCurrency(cat.value)}
                                        </span>
                                        <span className="reports-legend-percent">
                                            {cat.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Trend Chart */}
            <div className="reports-card">
                <h2 className="reports-card-title">
                    Tren Pengeluaran
                </h2>

                <div className="reports-trend-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#43A047" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#43A047" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value), 'Total']}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderColor: '#e5e7eb',
                                    borderRadius: '0.75rem',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#43A047"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Export Section */}
            <div className="reports-card">
                <div className="reports-export-content">
                    <div>
                        <h3 className="reports-export-title">
                            Export Laporan
                        </h3>
                        <p className="reports-export-subtitle">
                            Pilih format yang diinginkan
                        </p>
                    </div>
                    <div className="reports-export-buttons">
                        <button
                            onClick={handleExportExcel}
                            disabled={expenses.length === 0}
                            className="reports-export-btn reports-export-btn-excel"
                        >
                            <FileSpreadsheet className="reports-export-icon" />
                            <span className="reports-export-btn-text">Excel</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={expenses.length === 0}
                            className="reports-export-btn reports-export-btn-pdf"
                        >
                            <Download className="reports-export-icon" />
                            <span className="reports-export-btn-text">PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Export Buttons */}
            <div className="reports-mobile-export">
                <button
                    onClick={handleExportExcel}
                    disabled={expenses.length === 0}
                    className="reports-mobile-export-btn reports-mobile-export-btn-excel"
                >
                    <FileSpreadsheet className="reports-mobile-export-icon" />
                    Excel
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={expenses.length === 0}
                    className="reports-mobile-export-btn reports-mobile-export-btn-pdf"
                >
                    <Download className="reports-mobile-export-icon" />
                    PDF
                </button>
            </div>
        </div>
    );
}

export default Reports;
