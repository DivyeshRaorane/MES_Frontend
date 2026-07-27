/**
 * Export Utilities
 * Handles Excel, CSV, PDF, and Print exports for dynamic reports
 * Columns have: { key, field, label }
 */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Get cell value from row using column definition
 */
function getCellValue(row, col) {
  // Try field first (most reliable), then key
  const val = row[col.field] !== undefined ? row[col.field] : row[col.key];
  return val === null || val === undefined ? '' : val;
}

/**
 * Export data to Excel (.xlsx)
 */
export const exportToExcel = (data, columns, title = 'Report') => {
  if (!data || data.length === 0 || !columns || columns.length === 0) return;

  const headers = columns.map((col) => col.label);
  const rows = data.map((row) => columns.map((col) => getCellValue(row, col)));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = columns.map((col) => ({ wch: Math.max(col.label.length + 2, 15) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${formatDate(new Date())}.xlsx`;
  saveAs(blob, fileName);
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, columns, title = 'Report') => {
  if (!data || data.length === 0 || !columns || columns.length === 0) return;

  const headers = columns.map((col) => escapeCSV(col.label));
  const rows = data.map((row) =>
    columns.map((col) => escapeCSV(String(getCellValue(row, col))))
  );

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${formatDate(new Date())}.csv`;
  saveAs(blob, fileName);
};

/**
 * Export data to PDF
 */
export const exportToPDF = (data, columns, title = 'Report') => {
  if (!data || data.length === 0 || !columns || columns.length === 0) return;

  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);
  doc.text(`Total Records: ${data.length}`, 14, 25);

  const headers = columns.map((col) => col.label);
  const tableData = data.map((row) =>
    columns.map((col) => String(getCellValue(row, col)))
  );

  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 30, right: 10, bottom: 15, left: 10 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 8);
    },
  });

  const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${formatDate(new Date())}.pdf`;
  doc.save(fileName);
};

/**
 * Print report
 */
export const printReport = (data, columns, title = 'Report') => {
  if (!data || data.length === 0 || !columns || columns.length === 0) return;

  const headers = columns.map((col) => `<th>${escapeHTML(col.label)}</th>`).join('');
  const rows = data.map((row, idx) => {
    const cells = columns.map((col) => `<td>${escapeHTML(String(getCellValue(row, col)))}</td>`).join('');
    return `<tr class="${idx % 2 === 0 ? 'even' : 'odd'}">${cells}</tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><title>${escapeHTML(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; font-size: 11px; }
      h1 { font-size: 16px; margin-bottom: 4px; }
      .meta { color: #666; font-size: 9px; margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #1e293b; color: white; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
      td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
      tr.odd { background: #f8fafc; }
      @media print { body { margin: 10px; } }
    </style></head><body>
    <h1>${escapeHTML(title)}</h1>
    <div class="meta">Generated: ${new Date().toLocaleString()} | Total Records: ${data.length}</div>
    <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.print(); };
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeCSV(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHTML(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}
