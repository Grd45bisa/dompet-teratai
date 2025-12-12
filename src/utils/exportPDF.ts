import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Expense } from '../lib/api';

interface PDFReportData {
    expenses: Expense[];
    periodLabel: string;
    totalAmount: number;
    categoryBreakdown: { name: string; value: number; percentage: number; color: string }[];
    userName?: string;
}

// Format currency for PDF
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}

// Load image and convert to base64
function loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}

export async function generatePDFReport(data: PDFReportData): Promise<void> {
    const { expenses, periodLabel, totalAmount, categoryBreakdown, userName } = data;

    // Create PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Colors
    const primaryColor = { r: 67, g: 160, b: 71 }; // #43A047
    const grayColor = { r: 107, g: 114, b: 128 };
    const darkColor = { r: 31, g: 41, b: 55 };

    // =========================================
    // HEADER WITH LOGO
    // =========================================

    // Try to load and embed the actual logo image
    try {
        const logoBase64 = await loadImageAsBase64('/Logotrans-Teratai.webp');
        doc.addImage(logoBase64, 'PNG', margin, yPos, 12, 12);
    } catch {
        // Fallback: draw a simple lotus icon
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.circle(margin + 6, yPos + 6, 6, 'F');

        doc.setFillColor(255, 255, 255);
        doc.ellipse(margin + 6, yPos + 5, 1.5, 3, 'F');
        doc.ellipse(margin + 4, yPos + 6, 1.5, 2.5, 'F');
        doc.ellipse(margin + 8, yPos + 6, 1.5, 2.5, 'F');
    }

    // Brand name - "Dompet" in green, "Teratai" in dark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text('Dompet', margin + 16, yPos + 8);

    const dompetWidth = doc.getTextWidth('Dompet ');
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text('Teratai', margin + 16 + dompetWidth, yPos + 8);

    // Report date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text(`Dibuat: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`, pageWidth - margin, yPos + 5, { align: 'right' });

    if (userName) {
        doc.text(`Oleh: ${userName}`, pageWidth - margin, yPos + 10, { align: 'right' });
    }

    yPos += 20;

    // Divider line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // =========================================
    // REPORT TITLE
    // =========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text('Laporan Pengeluaran', margin, yPos);
    yPos += 8;

    // Period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text(`Periode: ${periodLabel}`, margin, yPos);
    yPos += 12;

    // =========================================
    // SUMMARY BOX
    // =========================================
    const summaryBoxHeight = 25;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), summaryBoxHeight, 3, 3, 'F');

    // Total spending
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text('Total Pengeluaran', margin + 8, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(`Rp ${formatRupiah(totalAmount)}`, margin + 8, yPos + 18);

    // Transaction count
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text('Jumlah Transaksi', pageWidth / 2, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text(`${expenses.length} kali`, pageWidth / 2, yPos + 18);

    // Average
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text('Rata-rata', pageWidth - margin - 45, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text(`Rp ${formatRupiah(Math.round(avgAmount))}`, pageWidth - margin - 45, yPos + 18);

    yPos += summaryBoxHeight + 12;

    // =========================================
    // CATEGORY BREAKDOWN
    // =========================================
    if (categoryBreakdown.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
        doc.text('Pengeluaran per Kategori', margin, yPos);
        yPos += 6;

        const categoryData = categoryBreakdown.map((cat, index) => [
            (index + 1).toString(),
            cat.name,
            `Rp ${formatRupiah(cat.value)}`,
            `${cat.percentage.toFixed(1)}%`,
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Kategori', 'Jumlah', 'Persentase']],
            body: categoryData,
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [darkColor.r, darkColor.g, darkColor.b],
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 40, halign: 'right' },
                3: { cellWidth: 25, halign: 'center' },
            },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // =========================================
    // TRANSACTION DETAILS
    // =========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text('Detail Transaksi', margin, yPos);
    yPos += 6;

    if (expenses.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
        doc.text('Tidak ada transaksi pada periode ini.', margin, yPos + 5);
    } else {
        const transactionData = expenses.map((exp, index) => [
            (index + 1).toString(),
            format(new Date(exp.expense_date), 'dd MMM yyyy', { locale: id }),
            exp.category?.name || 'Lainnya',
            exp.description || '-',
            `Rp ${formatRupiah(exp.amount)}`,
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah']],
            body: transactionData,
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [darkColor.r, darkColor.g, darkColor.b],
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 25 },
                2: { cellWidth: 30 },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 30, halign: 'right' },
            },
            didDrawPage: (_data) => {
                const pageNumber = doc.getCurrentPageInfo().pageNumber;
                const totalPages = doc.getNumberOfPages();

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
                doc.text(
                    `Halaman ${pageNumber} dari ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );

                doc.text(
                    'Dompet Teratai - Laporan Pengeluaran',
                    margin,
                    pageHeight - 10
                );
            },
        });
    }

    // =========================================
    // FOOTER NOTE
    // =========================================
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;

    if (finalY < pageHeight - 40) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
        doc.text(
            'Laporan ini dibuat secara otomatis oleh Dompet Teratai.',
            margin,
            finalY + 15
        );
        doc.text(
            'Data di atas merupakan ringkasan pengeluaran berdasarkan periode yang dipilih.',
            margin,
            finalY + 20
        );
    }

    // =========================================
    // SAVE PDF
    // =========================================
    const fileName = `Laporan_Pengeluaran_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
    doc.save(fileName);
}

export default generatePDFReport;
