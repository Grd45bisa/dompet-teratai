import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import type { ChartDataPoint, MonthlyChartData } from '../../types';

interface ExpenseChartProps {
    type: 'bar' | 'pie';
    data: ChartDataPoint[] | MonthlyChartData[];
    title: string;
    height?: number;
}

const COLORS = [
    '#43A047', '#2196F3', '#FF9800', '#E91E63',
    '#9C27B0', '#00BCD4', '#8BC34A', '#FFC107',
];

export function ExpenseChart({
    type,
    data,
    title,
    height = 300,
}: ExpenseChartProps) {
    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: Array<{ value: number; name: string; color?: string }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-darkCard px-4 py-2 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {label || payload[0].name}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    {type === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12 }}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Jt`}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="total"
                                fill="#43A047"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data as ChartDataPoint[]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                            >
                                {(data as ChartDataPoint[]).map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(value) => (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                                )}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default ExpenseChart;
