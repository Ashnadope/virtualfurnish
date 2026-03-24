/**
 * Analytics export utilities — CSV, Excel (.xls HTML table), and PDF (jsPDF).
 * All functions are client-side only (called from 'use client' components).
 */

const RANGE_LABELS = {
  '7days':  'Last 7 Days',
  '30days': 'Last 30 Days',
  '90days': 'Last 90 Days',
  'year':   'This Year',
};

function getDateLabel(dateRange) {
  return RANGE_LABELS[dateRange] || dateRange;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-PH');
}

function safeFilename(dateRange) {
  return `analytics-report-${dateRange}-${todayLabel().replace(/\//g, '-')}`;
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── CSV ──────────────────────────────────────────────────────────────────────

export function exportAnalyticsCSV(data, dateRange) {
  const label = getDateLabel(dateRange);
  const rows  = [];

  const push  = (...cols) => rows.push(cols.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
  const blank = () => rows.push('');

  push('VirtualFurnish - Analytics Report');
  push('Date Range:', label);
  push('Generated:', todayLabel());
  blank();

  push('SUMMARY METRICS');
  push('Metric', 'Value', 'Change vs Previous Period');
  (data.metrics || []).forEach(m => push(m.title, m.value, m.change));
  blank();

  push('MONTHLY SALES TRENDS');
  push('Month', 'Revenue (PHP)', 'Orders');
  (data.salesData || []).forEach(s => push(s.month, s.revenue, s.orders));
  blank();

  push('TOP PRODUCTS');
  push('Product', 'Category', 'Units Sold', 'Revenue (PHP)');
  (data.topProducts || []).forEach(p => push(p.name, p.category, p.unitsSold, p.revenue));
  blank();

  push('CUSTOMER SEGMENTS');
  push('Segment', 'Count');
  (data.customerSegments || []).forEach(c => push(c.name, c.value));
  blank();

  push('ROOM DESIGNER STATS');
  push('Metric', 'Value', 'Note');
  (data.roomDesignerStats || []).forEach(r => push(r.label, r.value, r.change));
  blank();

  push('GEOGRAPHIC DISTRIBUTION (TOP 5)');
  push('City', 'Orders', 'Revenue (PHP)', '% of Orders');
  (data.geographicData || []).forEach(g => push(g.name, g.orders, g.revenue, `${g.percentage}%`));

  triggerDownload(rows.join('\r\n'), `${safeFilename(dateRange)}.csv`, 'text/csv;charset=utf-8;');
}

// ── Excel (.xls via HTML table) ──────────────────────────────────────────────

export function exportAnalyticsExcel(data, dateRange) {
  const label = getDateLabel(dateRange);

  const htmlTable = (headers, rows) => `
    <table border="1" style="border-collapse:collapse;margin-bottom:20px;font-family:Arial,sans-serif;font-size:11px;">
      <thead>
        <tr style="background-color:#4f46e5;color:white;">
          ${headers.map(h => `<th style="padding:7px 12px;white-space:nowrap;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr style="background-color:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
            ${r.map(c => `<td style="padding:5px 12px;white-space:nowrap;">${c ?? ''}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>`;

  const section = (title, headers, rows) => `
    <h3 style="font-family:Arial,sans-serif;color:#1e1b4b;margin:20px 0 6px;">${title}</h3>
    ${htmlTable(headers, rows)}`;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/></head>
    <body>
      <h1 style="font-family:Arial,sans-serif;color:#4f46e5;">VirtualFurnish — Analytics Report</h1>
      <p style="font-family:Arial,sans-serif;font-size:12px;">
        <b>Date Range:</b> ${label} &nbsp;&nbsp; <b>Generated:</b> ${todayLabel()}
      </p>

      ${section('Summary Metrics',
        ['Metric', 'Value', 'Change vs Previous Period'],
        (data.metrics || []).map(m => [m.title, m.value, m.change])
      )}

      ${section('Monthly Sales Trends',
        ['Month', 'Revenue (PHP)', 'Orders'],
        (data.salesData || []).map(s => [s.month, s.revenue, s.orders])
      )}

      ${section('Top Products',
        ['Product', 'Category', 'Units Sold', 'Revenue (PHP)'],
        (data.topProducts || []).map(p => [p.name, p.category, p.unitsSold, p.revenue])
      )}

      ${section('Customer Segments',
        ['Segment', 'Count'],
        (data.customerSegments || []).map(c => [c.name, c.value])
      )}

      ${section('Room Designer Stats',
        ['Metric', 'Value', 'Note'],
        (data.roomDesignerStats || []).map(r => [r.label, r.value, r.change])
      )}

      ${section('Geographic Distribution (Top 5)',
        ['City', 'Orders', 'Revenue (PHP)', '% of Orders'],
        (data.geographicData || []).map(g => [g.name, g.orders, g.revenue, `${g.percentage}%`])
      )}
    </body>
    </html>`;

  triggerDownload(html, `${safeFilename(dateRange)}.xls`, 'application/vnd.ms-excel');
}

// ── PDF (jsPDF) ───────────────────────────────────────────────────────────────

export async function exportAnalyticsPDF(data, dateRange) {
  const { default: jsPDF } = await import('jspdf');

  const label     = getDateLabel(dateRange);
  const doc       = new jsPDF();
  const pageW     = doc.internal.pageSize.getWidth();
  const pageH     = doc.internal.pageSize.getHeight();
  const MARGIN    = 14;
  let y           = 20;

  // Indigo brand colour
  const BRAND_R = 79, BRAND_G = 70, BRAND_B = 229;

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - 16) { doc.addPage(); y = 20; }
  };

  const sectionHeader = (title) => {
    checkPage(14);
    doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
    doc.rect(MARGIN, y - 5, pageW - MARGIN * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN + 2, y + 1);
    doc.setTextColor(0, 0, 0);
    y += 10;
  };

  const tableRow = (cols, isHeader = false) => {
    checkPage(8);
    const colW = (pageW - MARGIN * 2) / cols.length;
    if (isHeader) {
      doc.setFillColor(230, 230, 240);
      doc.rect(MARGIN, y - 4, pageW - MARGIN * 2, 7, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    cols.forEach((text, i) => {
      // Truncate long strings to avoid overflow
      const str = String(text ?? '');
      const maxChars = Math.floor(colW / 1.8);
      doc.text(str.length > maxChars ? str.slice(0, maxChars - 1) + '…' : str, MARGIN + colW * i + 1, y);
    });
    y += 7;
  };

  // ── Document title ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_R, BRAND_G, BRAND_B);
  doc.text('VirtualFurnish', MARGIN, y);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text('Analytics Report', MARGIN, y + 8);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Date Range: ${label}   |   Generated: ${todayLabel()}`, MARGIN, y + 16);

  doc.setDrawColor(BRAND_R, BRAND_G, BRAND_B);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 20, pageW - MARGIN, y + 20);
  y += 28;
  doc.setTextColor(0, 0, 0);

  // ── Summary Metrics ──
  sectionHeader('SUMMARY METRICS');
  tableRow(['Metric', 'Value', 'Change vs Previous Period'], true);
  (data.metrics || []).forEach(m => tableRow([m.title, m.value, m.change]));
  y += 4;

  // ── Monthly Sales ──
  sectionHeader('MONTHLY SALES TRENDS');
  tableRow(['Month', 'Revenue (PHP)', 'Orders'], true);
  (data.salesData || []).forEach(s => tableRow([s.month, String(s.revenue), String(s.orders)]));
  y += 4;

  // ── Top Products ──
  sectionHeader('TOP PRODUCTS');
  tableRow(['Product', 'Category', 'Units Sold', 'Revenue (PHP)'], true);
  (data.topProducts || []).forEach(p => tableRow([p.name, p.category, String(p.unitsSold), p.revenue]));
  y += 4;

  // ── Customer Segments ──
  sectionHeader('CUSTOMER SEGMENTS');
  tableRow(['Segment', 'Count'], true);
  (data.customerSegments || []).forEach(c => tableRow([c.name, String(c.value)]));
  y += 4;

  // ── Room Designer Stats ──
  sectionHeader('ROOM DESIGNER STATS');
  tableRow(['Metric', 'Value', 'Note'], true);
  (data.roomDesignerStats || []).forEach(r => tableRow([r.label, r.value, r.change]));
  y += 4;

  // ── Geographic Distribution ──
  sectionHeader('GEOGRAPHIC DISTRIBUTION (TOP 5)');
  tableRow(['City', 'Orders', 'Revenue (PHP)', '% of Orders'], true);
  (data.geographicData || []).forEach(g => tableRow([g.name, String(g.orders), g.revenue, `${g.percentage}%`]));

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `VirtualFurnish Analytics  |  ${label}  |  Page ${i} of ${totalPages}`,
      MARGIN,
      pageH - 8
    );
  }

  doc.save(`${safeFilename(dateRange)}.pdf`);
}
