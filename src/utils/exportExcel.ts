import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Expense } from '../types';

interface ExportOptions {
    expenses: Expense[];
    periodLabel: string;
    dateFrom: string;
    dateTo: string;
}

/**
 * Format number as Indonesian Rupiah
 */
function formatRupiah(amount: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Export expenses to Excel - Simple & Clean format
 */
export function exportToExcel({ expenses, periodLabel, dateFrom: _dateFrom, dateTo: _dateTo }: ExportOptions): void {
    // Calculate summary
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const count = expenses.length;
    const average = count > 0 ? Math.round(totalAmount / count) : 0;

    // Calculate category breakdown
    const categoryMap: Record<string, { name: string; total: number; count: number }> = {};
    expenses.forEach((expense) => {
        const catId = expense.category_id || 'other';
        const catName = expense.category?.name || 'Lainnya';
        if (!categoryMap[catId]) {
            categoryMap[catId] = { name: catName, total: 0, count: 0 };
        }
        categoryMap[catId].total += Number(expense.amount);
        categoryMap[catId].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap)
        .sort((a, b) => b.total - a.total);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // ========================================
    // SHEET 1: LAPORAN PENGELUARAN (Main)
    // ========================================
    const mainData: (string | number)[][] = [];

    // Title
    mainData.push(['LAPORAN PENGELUARAN']);
    mainData.push(['Dompet Teratai']);
    mainData.push([]);

    // Report info
    mainData.push(['Periode:', periodLabel]);
    mainData.push(['Tanggal Cetak:', format(new Date(), 'dd MMMM yyyy', { locale: id })]);
    mainData.push([]);

    // Summary - simple and clear
    mainData.push(['RINGKASAN']);
    mainData.push(['Total Pengeluaran', formatRupiah(totalAmount)]);
    mainData.push(['Jumlah Transaksi', count + ' kali']);
    mainData.push(['Rata-rata', formatRupiah(average)]);
    mainData.push([]);

    // Category summary
    mainData.push(['PENGELUARAN PER KATEGORI']);
    mainData.push(['Kategori', 'Jumlah', 'Berapa Kali']);

    categoryBreakdown.forEach((cat) => {
        mainData.push([cat.name, formatRupiah(cat.total), cat.count + ' kali']);
    });

    mainData.push([]);
    mainData.push(['DAFTAR TRANSAKSI']);
    mainData.push(['No', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah']);

    // Sort by date (newest first)
    const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );

    // Transaction list
    sortedExpenses.forEach((expense, index) => {
        mainData.push([
            index + 1,
            format(new Date(expense.expense_date), 'dd/MM/yyyy', { locale: id }),
            expense.category?.name || 'Lainnya',
            expense.description || '-',
            formatRupiah(Number(expense.amount)),
        ]);
    });

    // Total at bottom
    mainData.push([]);
    mainData.push(['', '', '', 'TOTAL', formatRupiah(totalAmount)]);

    const mainWs = XLSX.utils.aoa_to_sheet(mainData);

    // Set column widths for readability
    mainWs['!cols'] = [
        { wch: 6 },   // No
        { wch: 12 },  // Tanggal
        { wch: 20 },  // Kategori
        { wch: 30 },  // Keterangan
        { wch: 18 },  // Jumlah
    ];

    XLSX.utils.book_append_sheet(wb, mainWs, 'Laporan');

    // Generate filename
    const fileName = `Laporan_Pengeluaran_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;

    // Trigger download
    XLSX.writeFile(wb, fileName);
}

/**
 * Export summary data with category breakdown
 */
export function exportSummaryToExcel(
    periodLabel: string,
    categoryBreakdown: { name: string; total: number; percentage: number }[]
): void {
    const wb = XLSX.utils.book_new();
    const data: (string | number)[][] = [];

    data.push(['RINGKASAN PENGELUARAN']);
    data.push(['Periode:', periodLabel]);
    data.push(['Tanggal Cetak:', format(new Date(), 'dd MMMM yyyy', { locale: id })]);
    data.push([]);

    data.push(['PENGELUARAN PER KATEGORI']);
    data.push(['Kategori', 'Jumlah', 'Persentase']);

    categoryBreakdown.forEach((cat) => {
        data.push([cat.name, formatRupiah(cat.total), cat.percentage.toFixed(1) + '%']);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan');
    XLSX.writeFile(wb, `Ringkasan_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Format currency in compact form (e.g., 1.5jt)
 */
export function formatCompactCurrency(amount: number): string {
    if (amount >= 1000000000) {
        return `Rp${(amount / 1000000000).toFixed(1)}M`;
    }
    if (amount >= 1000000) {
        return `Rp${(amount / 1000000).toFixed(1)}jt`;
    }
    if (amount >= 1000) {
        return `Rp${(amount / 1000).toFixed(0)}rb`;
    }
    return formatCurrency(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}
