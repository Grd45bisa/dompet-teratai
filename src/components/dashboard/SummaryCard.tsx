import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';

interface SummaryCardProps {
    title: string;
    value: number;
    previousValue?: number;
    icon: React.ReactNode;
    iconBgColor?: string;
    trend?: 'up' | 'down' | 'neutral';
    compact?: boolean;
}

export function SummaryCard({
    title,
    value,
    previousValue,
    icon,
    iconBgColor = 'bg-primary-light',
    trend,
    compact = false,
}: SummaryCardProps) {
    // Calculate percentage change if previous value is provided
    const percentChange = previousValue
        ? ((value - previousValue) / previousValue) * 100
        : null;

    // Determine trend based on percentage change if not explicitly provided
    const displayTrend = trend ?? (percentChange !== null
        ? percentChange > 0
            ? 'up'
            : percentChange < 0
                ? 'down'
                : 'neutral'
        : 'neutral');

    const trendColors = {
        up: 'text-red-500 bg-red-50 dark:bg-red-500/10',
        down: 'text-green-500 bg-green-50 dark:bg-green-500/10',
        neutral: 'text-gray-500 bg-gray-50 dark:bg-gray-500/10',
    };

    const TrendIcon = {
        up: TrendingUp,
        down: TrendingDown,
        neutral: Minus,
    }[displayTrend];

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {compact ? formatCompactCurrency(value) : formatCurrency(value)}
                    </p>
                    {percentChange !== null && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trendColors[displayTrend]}`}
                            >
                                <TrendIcon className="w-3 h-3" />
                                {Math.abs(percentChange).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                vs bulan lalu
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBgColor}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

export default SummaryCard;
