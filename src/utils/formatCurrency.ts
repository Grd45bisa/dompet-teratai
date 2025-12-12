/**
 * Format a number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

/**
 * Format a number as compact currency (e.g., 1.5 Jt, 2.3 M)
 */
export function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
    }
    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
    }
    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(1)} Rb`;
    }
    return formatCurrency(amount);
}

export default formatCurrency;
