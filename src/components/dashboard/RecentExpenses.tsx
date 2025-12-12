import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Expense } from '../../types';

interface RecentExpensesProps {
    expenses: Expense[];
    maxItems?: number;
    showViewAll?: boolean;
}

export function RecentExpenses({
    expenses,
    maxItems = 5,
    showViewAll = true,
}: RecentExpensesProps) {
    const displayExpenses = expenses.slice(0, maxItems);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transaksi Terbaru</CardTitle>
                {showViewAll && (
                    <Link
                        to="/expenses"
                        className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                        Lihat Semua
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                {displayExpenses.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            Belum ada transaksi
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayExpenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                {/* Category color indicator */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${expense.category?.color || '#43A047'}20` }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: expense.category?.color || '#43A047' }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {expense.description || expense.category?.name || 'Pengeluaran'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {expense.category?.name} • {format(new Date(expense.expense_date), 'dd MMM yyyy', { locale: id })}
                                    </p>
                                </div>

                                {/* Amount */}
                                <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default RecentExpenses;
