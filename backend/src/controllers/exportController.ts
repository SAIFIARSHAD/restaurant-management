import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Bill from '../models/Bill';

// Helper: Date Range
const getDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;

  const toStart = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const toEnd = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  };

  const now = new Date();

  const start = startDate
    ? toStart(startDate as string)
    : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0); // month start

  const end = endDate
    ? toEnd(endDate as string)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return { start, end };
};

// SALES REPORT — EXCEL 
export const exportSalesExcel = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const orders = await Order.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      status: { $in: ['served', 'billed'] },
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    // Workbook setup
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Report');

    // Header styling
    sheet.columns = [
      { header: 'Order No', key: 'orderNumber', width: 15 },
      { header: 'Table', key: 'tableNumber', width: 10 },
      { header: 'Items', key: 'items', width: 30 },
      { header: 'Subtotal (Rs)', key: 'subtotal', width: 15 },
      { header: 'Tax (Rs)', key: 'tax', width: 12 },
      { header: 'Discount (Rs)', key: 'discount', width: 14 },
      { header: 'Total (Rs)', key: 'totalAmount', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'createdAt', width: 22 },
    ];

    // Bold header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Data rows
    orders.forEach((order) => {
      const itemNames = order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ');
      sheet.addRow({
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        items: itemNames,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: new Date(order.createdAt).toLocaleString('en-IN'),
      });
    });

    // Summary row
    sheet.addRow({});
    const summaryRow = sheet.addRow({
      orderNumber: 'TOTAL',
      subtotal: orders.reduce((s, o) => s + o.subtotal, 0),
      tax: orders.reduce((s, o) => s + o.tax, 0),
      discount: orders.reduce((s, o) => s + o.discount, 0),
      totalAmount: orders.reduce((s, o) => s + o.totalAmount, 0),
    });
    summaryRow.font = { bold: true };

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GST REPORT — PDF 
export const exportGSTPDF = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const bills = await Bill.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=gst_report_${Date.now()}.pdf`);
    doc.pipe(res);

    // HEADER
    doc.fontSize(18).font('Helvetica-Bold').text('GST REPORT', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(
      `Period: ${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}`,
      { align: 'center' }
    );
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();

    // TABLE HEADERS
    doc.fontSize(9).font('Helvetica-Bold');
    const y = doc.y;
    doc.text('Bill No', 40, y, { width: 80 });
    doc.text('Date', 120, y, { width: 90 });
    doc.text('Taxable Amt', 210, y, { width: 90, align: 'right' });
    doc.text('CGST', 300, y, { width: 70, align: 'right' });
    doc.text('SGST', 370, y, { width: 70, align: 'right' });
    doc.text('Total GST', 440, y, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    // DATA ROWS
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    doc.font('Helvetica').fontSize(9);
    bills.forEach((bill: any) => {
      const cgst = (bill as any).cgst || bill.tax / 2 || 0;
      const sgst = (bill as any).sgst || bill.tax / 2 || 0;
      const totalGST = cgst + sgst;

      totalTaxable += bill.subtotal || 0;
      totalCGST += cgst;
      totalSGST += sgst;

      const rowY = doc.y;
      doc.text(bill.billNumber || '-', 40, rowY, { width: 80 });
      doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN'), 120, rowY, { width: 90 });
      doc.text(`Rs ${bill.subtotal?.toFixed(2) || '0.00'}`, 210, rowY, { width: 90, align: 'right' });
      doc.text(`Rs ${cgst.toFixed(2)}`, 300, rowY, { width: 70, align: 'right' });
      doc.text(`Rs ${sgst.toFixed(2)}`, 370, rowY, { width: 70, align: 'right' });
      doc.text(`Rs ${totalGST.toFixed(2)}`, 440, rowY, { width: 80, align: 'right' });
      doc.moveDown(0.8);
    });

    // SUMMARY
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10);

    const sumY = doc.y;
    doc.text('TOTAL', 40, sumY, { width: 170 });
    doc.text(`Rs ${totalTaxable.toFixed(2)}`, 210, sumY, { width: 90, align: 'right' });
    doc.text(`Rs ${totalCGST.toFixed(2)}`, 300, sumY, { width: 70, align: 'right' });
    doc.text(`Rs ${totalSGST.toFixed(2)}`, 370, sumY, { width: 70, align: 'right' });
    doc.text(`Rs ${(totalCGST + totalSGST).toFixed(2)}`, 440, sumY, { width: 80, align: 'right' });

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// TOP ITEMS — EXCEL 
export const exportTopItemsExcel = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { start, end } = getDateRange(req);

    const data = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          status: { $in: ['served', 'billed'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Top Items');

    sheet.columns = [
      { header: 'Rank', key: 'rank', width: 8 },
      { header: 'Item Name', key: 'name', width: 30 },
      { header: 'Total Qty Sold', key: 'totalQuantity', width: 18 },
      { header: 'Total Revenue (Rs)', key: 'totalRevenue', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' },
    };

    data.forEach((item, index) => {
      sheet.addRow({
        rank: index + 1,
        name: item._id,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=top_items_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
