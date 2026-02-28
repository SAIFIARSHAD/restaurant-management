import { Request, Response } from 'express';
import QRCode from 'qrcode';
import Table from '../models/Table';

// @POST /api/tables
export const createTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber, capacity, floor, restaurantId } = req.body;

    // QR Code generate karo
    const qrData = JSON.stringify({
      restaurantId,
      tableNumber,
      url: `${process.env.CLIENT_URL}/menu/${restaurantId}?table=${tableNumber}`,
    });

    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    const table = await Table.create({
      restaurant: restaurantId,
      tableNumber,
      capacity,
      floor,
      qrCode: qrData,
      qrCodeUrl: qrCodeBase64,
    });

    res.status(201).json({ success: true, message: 'Table created!', table });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/tables/:restaurantId
export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await Table.find({
      restaurant: req.params.restaurantId,
      isActive: true,
    }).sort({ tableNumber: 1 });

    res.status(200).json({ success: true, count: tables.length, tables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/tables/:id/status
export const updateTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Table status updated!', table });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/tables/:id
export const deleteTable = async (req: Request, res: Response): Promise<void> => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Table deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
