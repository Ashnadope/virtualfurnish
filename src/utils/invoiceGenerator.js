import jsPDF from 'jspdf';

/**
 * Format a number as a PHP currency string safe for jsPDF (Latin-1 / Helvetica).
 * jsPDF built-in Helvetica does not include the peso sign (U+20B1), so we use
 * the ISO currency code "PHP" to avoid garbled spaced-out output in the PDF.
 */
const formatPeso = (amount) =>
  `PHP ${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Generate PDF invoice for an order
 * @param {object} order - Order details with items
 */
export const generateInvoice = (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VirtualFurnish', 20, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Philippine Furniture E-Commerce', 20, yPos + 8);
    doc.text('furniture@virtualfurnish.ph', 20, yPos + 14);

    // Invoice title
    yPos += 30;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 60, yPos);

    // Order details
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #: ${order?.orderNumber || 'N/A'}`, pageWidth - 80, yPos);
    doc.text(`Date: ${new Date(order?.createdAt).toLocaleDateString('en-PH')}`, pageWidth - 80, yPos + 6);
    doc.text(`Status: ${order?.status?.toUpperCase() || 'N/A'}`, pageWidth - 80, yPos + 12);

    // Shipping address
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('SHIP TO:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const addr = order?.shippingAddress;
    if (addr) {
      const name = `${addr.first_name || ''} ${addr.last_name || ''}`.trim();
      if (name) doc.text(name, 20, yPos + 6);
      doc.text(addr.address_line_1 || '', 20, yPos + 12);
      if (addr.address_line_2) { doc.text(addr.address_line_2, 20, yPos + 18); yPos += 6; }
      doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}`.trim(), 20, yPos + 18);
      doc.text(addr.country || 'Philippines', 20, yPos + 24);
      if (addr.phone) doc.text(`Phone: ${addr.phone}`, 20, yPos + 30);
    }

    // Table header
    yPos += 50;
    doc.setFillColor(41, 128, 185);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 25, yPos);
    doc.text('Qty', pageWidth - 100, yPos);
    doc.text('Price', pageWidth - 75, yPos);
    doc.text('Total', pageWidth - 40, yPos);

    // Items
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    order?.items?.forEach((item) => {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      const lines = doc.splitTextToSize(item?.name || 'Unknown Item', pageWidth - 120);
      doc.text(lines, 25, yPos);
      doc.text(String(item?.quantity || 0), pageWidth - 100, yPos);
      doc.text(formatPeso(item?.price), pageWidth - 75, yPos);
      doc.text(formatPeso(item?.total), pageWidth - 40, yPos);
      if (item?.variantName) {
        yPos += 5;
        doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        doc.text(`  ${item.variantName}`, 25, yPos);
        doc.setFontSize(10); doc.setTextColor(0, 0, 0);
      }
      yPos += lines.length * 5 + 8;
    });

    // Summary
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.subtotal), pageWidth - 40, yPos);
    yPos += 6;
    doc.text('Tax:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.taxAmount), pageWidth - 40, yPos);
    yPos += 6;
    doc.text('Shipping:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.shippingAmount), pageWidth - 40, yPos);
    if (order?.discountAmount > 0) {
      yPos += 6;
      doc.text('Discount:', pageWidth - 100, yPos);
      doc.text(`-${formatPeso(order?.discountAmount)}`, pageWidth - 40, yPos);
    }
    yPos += 8;
    doc.line(pageWidth - 105, yPos, pageWidth - 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('Total:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.totalAmount), pageWidth - 40, yPos);

    // Payment info
    yPos += 15;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${order?.paymentMethod?.toUpperCase() || 'N/A'}`, 20, yPos);
    doc.text(`Payment Status: ${order?.paymentStatus?.toUpperCase() || 'N/A'}`, 20, yPos + 6);

    // Footer
    doc.setFontSize(8); doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your purchase!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text('For inquiries, contact: furniture@virtualfurnish.ph', pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`Invoice-${order?.orderNumber || 'order'}.pdf`);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice. Please try again.');
  }
};

/**
 * Generate receipt for an order (simplified version)
 * @param {object} order - Order details
 */
export const generateReceipt = (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(24); doc.setFont('helvetica', 'bold');
    doc.text('VirtualFurnish', 20, yPos);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Philippine Furniture E-Commerce', 20, yPos + 8);
    doc.text('furniture@virtualfurnish.ph', 20, yPos + 14);

    // Receipt title + PAID stamp
    yPos += 30;
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', pageWidth - 60, yPos);
    // Green "PAID" box
    doc.setFillColor(39, 174, 96);
    doc.roundedRect(pageWidth - 65, yPos + 6, 38, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9);
    doc.text('PAYMENT CONFIRMED', pageWidth - 63, yPos + 13);
    doc.setTextColor(0, 0, 0);

    // Order details
    yPos += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Order #: ${order?.orderNumber || 'N/A'}`, pageWidth - 80, yPos + 8);
    doc.text(`Date: ${new Date(order?.createdAt).toLocaleDateString('en-PH')}`, pageWidth - 80, yPos + 14);
    doc.text(`Status: ${order?.status?.toUpperCase() || 'N/A'}`, pageWidth - 80, yPos + 20);

    // Shipping address
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('SHIP TO:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const addr = order?.shippingAddress;
    if (addr) {
      const name = `${addr.first_name || ''} ${addr.last_name || ''}`.trim();
      if (name) doc.text(name, 20, yPos + 6);
      doc.text(addr.address_line_1 || '', 20, yPos + 12);
      if (addr.address_line_2) { doc.text(addr.address_line_2, 20, yPos + 18); yPos += 6; }
      doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}`.trim(), 20, yPos + 18);
      doc.text(addr.country || 'Philippines', 20, yPos + 24);
      if (addr.phone) doc.text(`Phone: ${addr.phone}`, 20, yPos + 30);
    }

    // Items table header
    yPos += 50;
    doc.setFillColor(39, 174, 96);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('Item', 25, yPos);
    doc.text('Qty', pageWidth - 100, yPos);
    doc.text('Price', pageWidth - 75, yPos);
    doc.text('Total', pageWidth - 40, yPos);

    // Items
    yPos += 10;
    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal');
    order?.items?.forEach((item) => {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      const lines = doc.splitTextToSize(item?.name || 'Unknown Item', pageWidth - 120);
      doc.text(lines, 25, yPos);
      doc.text(String(item?.quantity || 0), pageWidth - 100, yPos);
      doc.text(formatPeso(item?.price), pageWidth - 75, yPos);
      doc.text(formatPeso(item?.total), pageWidth - 40, yPos);
      if (item?.variantName) {
        yPos += 5;
        doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        doc.text(`  ${item.variantName}`, 25, yPos);
        doc.setFontSize(10); doc.setTextColor(0, 0, 0);
      }
      yPos += lines.length * 5 + 8;
    });

    // Summary
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.subtotal), pageWidth - 40, yPos);
    yPos += 6;
    doc.text('Tax:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.taxAmount), pageWidth - 40, yPos);
    yPos += 6;
    doc.text('Shipping:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.shippingAmount), pageWidth - 40, yPos);
    if (order?.discountAmount > 0) {
      yPos += 6;
      doc.text('Discount:', pageWidth - 100, yPos);
      doc.text(`-${formatPeso(order?.discountAmount)}`, pageWidth - 40, yPos);
    }
    yPos += 8;
    doc.line(pageWidth - 105, yPos, pageWidth - 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('Total Paid:', pageWidth - 100, yPos);
    doc.text(formatPeso(order?.totalAmount), pageWidth - 40, yPos);

    // Payment info
    yPos += 15;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${order?.paymentMethod?.toUpperCase() || 'N/A'}`, 20, yPos);
    doc.text(`Payment Status: ${order?.paymentStatus?.toUpperCase() || 'N/A'}`, 20, yPos + 6);

    // Footer
    doc.setFontSize(8); doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your purchase!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text('For inquiries, contact: furniture@virtualfurnish.ph', pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`Receipt-${order?.orderNumber || 'order'}.pdf`);
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt. Please try again.');
  }
};