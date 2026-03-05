import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { calculateBillGST, GSTSlab } from '../utils/gstHelper';

interface BillItem {
  name: string;
  price: number;
  quantity: number;
  gstRate: GSTSlab;
}

interface BillData {
  billNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantGSTIN: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  items: BillItem[];
  isInterState?: boolean;
  paymentMethod: string;
  createdAt: Date;
}

export const generateBillPDF = (billData: BillData, res: Response) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=bill_${billData.billNumber}.pdf`
  );
  doc.pipe(res);

  // ─── HEADER ───
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(billData.restaurantName, { align: 'center' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(billData.restaurantAddress, { align: 'center' });

  doc
    .fontSize(10)
    .text(`GSTIN: ${billData.restaurantGSTIN}`, { align: 'center' });

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // ─── BILL INFO ───
  doc.fontSize(10).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(9).font('Helvetica');
  doc.text(`Bill No: ${billData.billNumber}`, 40, doc.y);
  doc.text(`Date: ${new Date(billData.createdAt).toLocaleString('en-IN')}`, {
    align: 'right',
  });

  doc.text(`Customer: ${billData.customerName}`);
  doc.text(`Phone: ${billData.customerPhone}`);
  doc.text(`Table: ${billData.tableNumber}`);
  doc.text(`Payment: ${billData.paymentMethod}`);

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // ─── TABLE HEADER ───
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('Item', 40, doc.y, { width: 200 });
  doc.text('Qty', 240, doc.y - 12, { width: 50, align: 'center' });
  doc.text('Price', 290, doc.y - 12, { width: 80, align: 'right' });
  doc.text('GST%', 370, doc.y - 12, { width: 50, align: 'center' });
  doc.text('Total', 420, doc.y - 12, { width: 80, align: 'right' });

  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);

  // ─── ITEMS ───
  doc.font('Helvetica').fontSize(9);
  billData.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    const y = doc.y;
    doc.text(item.name, 40, y, { width: 200 });
    doc.text(String(item.quantity), 240, y, { width: 50, align: 'center' });
    doc.text(`₹${item.price.toFixed(2)}`, 290, y, { width: 80, align: 'right' });
    doc.text(`${item.gstRate}%`, 370, y, { width: 50, align: 'center' });
    doc.text(`₹${itemTotal.toFixed(2)}`, 420, y, { width: 80, align: 'right' });
    doc.moveDown(0.8);
  });

  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // ─── GST SUMMARY ───
  const gstData = calculateBillGST(billData.items, billData.isInterState);
  const { summary } = gstData;

  doc.fontSize(9).font('Helvetica');
  doc.text(`Subtotal:`, 350, doc.y, { width: 120 });
  doc.text(`₹${summary.totalBase.toFixed(2)}`, 470, doc.y - 12, {
    width: 80,
    align: 'right',
  });
  doc.moveDown(0.5);

  if (!billData.isInterState) {
    doc.text(`CGST:`, 350, doc.y, { width: 120 });
    doc.text(`₹${summary.totalCGST.toFixed(2)}`, 470, doc.y - 12, {
      width: 80,
      align: 'right',
    });
    doc.moveDown(0.5);
    doc.text(`SGST:`, 350, doc.y, { width: 120 });
    doc.text(`₹${summary.totalSGST.toFixed(2)}`, 470, doc.y - 12, {
      width: 80,
      align: 'right',
    });
  } else {
    doc.text(`IGST:`, 350, doc.y, { width: 120 });
    doc.text(`₹${summary.totalIGST.toFixed(2)}`, 470, doc.y - 12, {
      width: 80,
      align: 'right',
    });
  }

  doc.moveDown(0.5);
  doc.moveTo(350, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);

  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`Grand Total:`, 350, doc.y, { width: 120 });
  doc.text(`₹${summary.grandTotal.toFixed(2)}`, 470, doc.y - 14, {
    width: 80,
    align: 'right',
  });

  // ─── FOOTER ───
  doc.moveDown(2);
  doc
    .fontSize(9)
    .font('Helvetica')
    .text('Thank you for dining with us!', { align: 'center' });
  doc.text('Please visit again.', { align: 'center' });

  doc.end();
};
