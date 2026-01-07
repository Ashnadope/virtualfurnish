import jsPDF from 'jspdf';

/**
 * Generate PDF invoice for an order
 * @param {object} order - Order details with items
 * @returns {Promise<void>}
 */
export const generateInvoice = (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc?.internal?.pageSize?.getWidth();
    const pageHeight = doc?.internal?.pageSize?.getHeight();
    let yPos = 20;

    // Header - Company Info
    doc?.setFontSize(24);
    doc?.setFont('helvetica', 'bold');
    doc?.text('VirtualFurnish', 20, yPos);
    
    doc?.setFontSize(10);
    doc?.setFont('helvetica', 'normal');
    doc?.text('Philippine Furniture E-Commerce', 20, yPos + 8);
    doc?.text('furniture@virtualfurnish.ph', 20, yPos + 14);

    // Invoice Title
    yPos += 30;
    doc?.setFontSize(18);
    doc?.setFont('helvetica', 'bold');
    doc?.text('INVOICE', pageWidth - 60, yPos);

    // Order Details
    yPos += 10;
    doc?.setFontSize(10);
    doc?.setFont('helvetica', 'normal');
    doc?.text(`Order #: ${order?.orderNumber || 'N/A'}`, pageWidth - 80, yPos);
    doc?.text(`Date: ${new Date(order?.createdAt)?.toLocaleDateString('en-PH') || 'N/A'}`, pageWidth - 80, yPos + 6);
    doc?.text(`Status: ${order?.status?.toUpperCase() || 'N/A'}`, pageWidth - 80, yPos + 12);

    // Shipping Address
    yPos += 25;
    doc?.setFont('helvetica', 'bold');
    doc?.text('SHIP TO:', 20, yPos);
    doc?.setFont('helvetica', 'normal');
    
    const shippingAddr = order?.shippingAddress;
    if (shippingAddr) {
      doc?.text(`${shippingAddr?.first_name || ''} ${shippingAddr?.last_name || ''}`, 20, yPos + 6);
      doc?.text(shippingAddr?.address_line_1 || '', 20, yPos + 12);
      if (shippingAddr?.address_line_2) {
        doc?.text(shippingAddr?.address_line_2, 20, yPos + 18);
        yPos += 6;
      }
      doc?.text(`${shippingAddr?.city || ''}, ${shippingAddr?.state || ''} ${shippingAddr?.postal_code || ''}`, 20, yPos + 18);
      doc?.text(`${shippingAddr?.country || 'Philippines'}`, 20, yPos + 24);
      doc?.text(`Phone: ${shippingAddr?.phone || 'N/A'}`, 20, yPos + 30);
    }

    // Items Table Header
    yPos += 50;
    doc?.setFillColor(41, 128, 185);
    doc?.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    
    doc?.setTextColor(255, 255, 255);
    doc?.setFont('helvetica', 'bold');
    doc?.text('Item', 25, yPos);
    doc?.text('Qty', pageWidth - 100, yPos);
    doc?.text('Price', pageWidth - 70, yPos);
    doc?.text('Total', pageWidth - 35, yPos);

    // Items
    yPos += 10;
    doc?.setTextColor(0, 0, 0);
    doc?.setFont('helvetica', 'normal');

    order?.items?.forEach((item, index) => {
      if (yPos > pageHeight - 40) {
        doc?.addPage();
        yPos = 20;
      }

      const itemName = item?.name || 'Unknown Item';
      const maxWidth = pageWidth - 120;
      const lines = doc?.splitTextToSize(itemName, maxWidth);
      
      doc?.text(lines, 25, yPos);
      doc?.text(String(item?.quantity || 0), pageWidth - 100, yPos);
      doc?.text(`₱${(item?.price || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 70, yPos);
      doc?.text(`₱${(item?.total || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);

      if (item?.variantName) {
        yPos += 5;
        doc?.setFontSize(8);
        doc?.setTextColor(100, 100, 100);
        doc?.text(`  ${item?.variantName}`, 25, yPos);
        doc?.setFontSize(10);
        doc?.setTextColor(0, 0, 0);
      }

      yPos += lines?.length * 5 + 8;
    });

    // Summary
    yPos += 10;
    doc?.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    doc?.text('Subtotal:', pageWidth - 100, yPos);
    doc?.text(`₱${(order?.subtotal || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);

    yPos += 6;
    doc?.text('Tax:', pageWidth - 100, yPos);
    doc?.text(`₱${(order?.taxAmount || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);

    yPos += 6;
    doc?.text('Shipping:', pageWidth - 100, yPos);
    doc?.text(`₱${(order?.shippingAmount || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);

    if (order?.discountAmount > 0) {
      yPos += 6;
      doc?.text('Discount:', pageWidth - 100, yPos);
      doc?.text(`-₱${(order?.discountAmount || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);
    }

    yPos += 8;
    doc?.line(pageWidth - 105, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc?.setFont('helvetica', 'bold');
    doc?.setFontSize(12);
    doc?.text('Total:', pageWidth - 100, yPos);
    doc?.text(`₱${(order?.totalAmount || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 35, yPos);

    // Payment Info
    yPos += 15;
    doc?.setFontSize(10);
    doc?.setFont('helvetica', 'normal');
    doc?.text(`Payment Method: ${order?.paymentMethod?.toUpperCase() || 'N/A'}`, 20, yPos);
    doc?.text(`Payment Status: ${order?.paymentStatus?.toUpperCase() || 'N/A'}`, 20, yPos + 6);

    // Footer
    const footerY = pageHeight - 20;
    doc?.setFontSize(8);
    doc?.setTextColor(128, 128, 128);
    doc?.text('Thank you for your purchase!', pageWidth / 2, footerY, { align: 'center' });
    doc?.text('For inquiries, contact: furniture@virtualfurnish.ph', pageWidth / 2, footerY + 5, { align: 'center' });

    // Save PDF
    doc?.save(`Invoice-${order?.orderNumber || 'order'}.pdf`);
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
    const pageWidth = doc?.internal?.pageSize?.getWidth();
    let yPos = 20;

    // Receipt Header
    doc?.setFontSize(20);
    doc?.setFont('helvetica', 'bold');
    doc?.text('RECEIPT', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc?.setFontSize(12);
    doc?.setFont('helvetica', 'normal');
    doc?.text('VirtualFurnish', pageWidth / 2, yPos, { align: 'center' });
    doc?.text('Philippine Furniture E-Commerce', pageWidth / 2, yPos + 6, { align: 'center' });

    yPos += 20;
    doc?.text(`Order #: ${order?.orderNumber || 'N/A'}`, 20, yPos);
    doc?.text(`Date: ${new Date(order?.createdAt)?.toLocaleDateString('en-PH') || 'N/A'}`, 20, yPos + 6);

    yPos += 20;
    doc?.text(`Total Amount: ₱${(order?.totalAmount || 0)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 20, yPos);
    doc?.text(`Payment: ${order?.paymentMethod?.toUpperCase() || 'N/A'}`, 20, yPos + 6);
    doc?.text(`Status: ${order?.paymentStatus?.toUpperCase() || 'N/A'}`, 20, yPos + 12);

    // Save PDF
    doc?.save(`Receipt-${order?.orderNumber || 'order'}.pdf`);
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt. Please try again.');
  }
};