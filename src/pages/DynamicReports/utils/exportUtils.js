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

// ─── Multi-Sheet/Multi-Table Excel Export ───────────────────────────────────

/**
 * Export a multi-sheet report to Excel (.xlsx)
 * Each sheet contains multiple tables, placed sequentially with configurable spacing.
 *
 * @param {Object} reportData - The execution result from the backend
 *   Shape: { sheets: [{ sheetName, tables: [{ title, columns: [{field, header}], data: [], spacing }] }] }
 * @param {string} reportTitle - Report name for the file name
 */
export const exportMultiSheetToExcel = (reportData, reportTitle = 'Report') => {
  if (!reportData || !reportData.sheets || reportData.sheets.length === 0) return;

  const wb = XLSX.utils.book_new();

  reportData.sheets.forEach((sheet) => {
    // Sanitize sheet name for Excel (max 31 chars, no invalid chars)
    const sheetName = sanitizeSheetName(sheet.sheetName || 'Sheet');

    // Build the sheet content: multiple tables stacked vertically
    const aoa = []; // Array of arrays for the entire sheet

    sheet.tables.forEach((table, tableIdx) => {
      const { title, columns, data, spacing = 2 } = table;

      // Write table title row (if provided)
      if (title) {
        aoa.push([title]);
        // Empty row after title
      }

      // Write column headers
      if (columns && columns.length > 0) {
        const headerRow = columns.map((col) => col.header || col.label || col.field);
        aoa.push(headerRow);

        // Write data rows
        if (data && data.length > 0) {
          data.forEach((row) => {
            const dataRow = columns.map((col) => {
              const val = row[col.field] !== undefined ? row[col.field] : row[col.key] || '';
              return val === null || val === undefined ? '' : val;
            });
            aoa.push(dataRow);
          });
        }
      }

      // Add blank spacing rows between tables (except after the last table)
      if (tableIdx < sheet.tables.length - 1) {
        const blankRows = Math.max(0, Math.min(spacing || 2, 10));
        for (let i = 0; i < blankRows; i++) {
          aoa.push([]);
        }
      }
    });

    // Create worksheet from array of arrays
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Apply column widths based on the widest table in this sheet
    const maxCols = Math.max(...sheet.tables.map(t => (t.columns || []).length), 1);
    ws['!cols'] = Array.from({ length: maxCols }, () => ({ wch: 18 }));

    // Apply basic styling: bold title rows and header rows
    applyMultiTableStyles(ws, sheet.tables);

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Generate and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `${reportTitle.replace(/[^a-z0-9]/gi, '_')}_${formatDate(new Date())}.xlsx`;
  saveAs(blob, fileName);
};

/**
 * Client-side multi-sheet export from local execution results.
 * Used when the backend returns all tables' data in one response.
 *
 * @param {Array} sheets - Array of sheet configs from Redux state
 *   Each sheet: { sheetName, tables: [{ tableName, columnOrder, columnDisplayNames, data }] }
 * @param {Object} executionResult - Backend response with data per sheet/table
 * @param {string} reportTitle - Report name
 */
export const exportMultiSheetFromState = (sheets, executionResult, reportTitle = 'Report') => {
  if (!executionResult || !executionResult.sheets) return;

  // Map execution results to the format expected by exportMultiSheetToExcel
  const reportData = {
    sheets: executionResult.sheets.map((exSheet) => ({
      sheetName: exSheet.sheetName || exSheet.sheet_name || 'Sheet',
      tables: (exSheet.tables || []).map((exTable) => ({
        title: exTable.title || exTable.table_name || '',
        columns: exTable.columns || [],
        data: exTable.data || exTable.rows || [],
        spacing: exTable.spacing ?? 2,
      })),
    })),
  };

  exportMultiSheetToExcel(reportData, reportTitle);
};

// ─── Multi-Sheet Helpers ────────────────────────────────────────────────────

/**
 * Sanitize sheet name for Excel compatibility
 * - Max 31 characters
 * - No: \ / * ? [ ] :
 * - Not blank
 */
function sanitizeSheetName(name) {
  let sanitized = String(name).replace(/[\\/*?[\]:]/g, '').trim();
  if (!sanitized) sanitized = 'Sheet';
  return sanitized.substring(0, 31);
}

/**
 * Apply basic cell styles to a worksheet with multiple tables.
 * Since xlsx (SheetJS community edition) doesn't support full styling,
 * this sets column widths intelligently based on content.
 */
function applyMultiTableStyles(ws, tables) {
  // Calculate maximum column width from all tables
  let maxCols = 0;
  const colWidths = [];

  tables.forEach((table) => {
    if (!table.columns) return;
    maxCols = Math.max(maxCols, table.columns.length);
    table.columns.forEach((col, idx) => {
      const headerLen = (col.header || col.label || col.field || '').length;
      const currentMax = colWidths[idx] || 10;
      colWidths[idx] = Math.max(currentMax, headerLen + 2, 12);
    });

    // Check data widths (sample first 20 rows)
    if (table.data) {
      table.data.slice(0, 20).forEach((row) => {
        table.columns.forEach((col, idx) => {
          const val = row[col.field] !== undefined ? row[col.field] : '';
          const len = String(val).length;
          colWidths[idx] = Math.min(Math.max(colWidths[idx] || 10, len + 1), 40);
        });
      });
    }
  });

  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
}
