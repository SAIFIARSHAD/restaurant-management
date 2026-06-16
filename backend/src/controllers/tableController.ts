import { Request, Response } from 'express';
import QRCode from 'qrcode';
import Table from '../models/Table';
import Restaurant from '../models/Restaurant';
import { io } from '../server';

const getRestaurantId = (req: Request) => {
  const user = (req as any).user;
  const restaurant = user?.restaurant;
  if (!restaurant) return null;
  if (restaurant['$oid']) return restaurant['$oid'];
  if (restaurant._id) return restaurant._id.toString();
  return restaurant.toString();
};

const getCustomerTableUrl = (clientUrl: string, slug: string, tableId: string) => {
  return `${clientUrl}/r/${slug}/${tableId}`;
};

// ✅ Create Table
export const createTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { tableNumber, capacity, floor } = req.body;

    if (!restaurantId) {
      res.status(400).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId).select('slug name');
    if (!restaurant || !restaurant.slug) {
      res.status(400).json({
        success: false,
        message: 'Restaurant slug not found. Please update restaurant details first.',
      });
      return;
    }

    const exists = await Table.findOne({
      restaurant: restaurantId,
      tableNumber,
      isActive: true,
    });

    if (exists) {
      res.status(400).json({
        success: false,
        message: `Table ${tableNumber} already exists!`,
      });
      return;
    }

    const table = await Table.create({
      restaurant: restaurantId,
      tableNumber,
      capacity: capacity || 4,
      floor: floor || 'Ground Floor',
      qrCode: '',
      qrCodeUrl: '',
    });

    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
      res.status(500).json({
        success: false,
        message: 'CLIENT_URL is not configured in environment.',
      });
      return;
    }

    const customerUrl = getCustomerTableUrl(
      clientUrl,
      restaurant.slug,
      table._id.toString()
    );

    const qrCodeBase64 = await QRCode.toDataURL(customerUrl);

    table.qrCode = customerUrl;
    table.qrCodeUrl = qrCodeBase64;
    await table.save();

    io.to(`restaurant_${restaurantId}`).emit('table_created', table);

    res.status(201).json({
      success: true,
      message: 'Table created!',
      table,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Tables
export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);

    const tables = await Table.find({
      restaurant: restaurantId,
      isActive: true,
    }).sort({ floor: 1, tableNumber: 1 });

    res.status(200).json({ success: true, count: tables.length, tables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Table
export const updateTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { tableNumber, capacity, floor, status } = req.body;

    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId, isActive: true },
      { tableNumber, capacity, floor, status },
      { new: true }
    );

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    io.to(`restaurant_${restaurantId}`).emit('table_updated', {
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
      floor: table.floor,
    });

    res.status(200).json({ success: true, message: 'Table updated!', table });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Status only
export const updateTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { status } = req.body;

    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId, isActive: true },
      { status },
      { new: true }
    );

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    io.to(`restaurant_${restaurantId}`).emit('table_status_changed', {
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
    });

    res.status(200).json({ success: true, message: 'Table status updated!', table });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Merge Tables
export const mergeTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { tableIds, mergedLabel } = req.body;

    if (!tableIds || tableIds.length < 2) {
      res.status(400).json({ success: false, message: 'At least 2 tables required to merge!' });
      return;
    }

    await Table.updateMany(
      { _id: { $in: tableIds }, restaurant: restaurantId },
      { status: 'reserved', mergedWith: tableIds, mergedLabel }
    );

    const tables = await Table.find({ _id: { $in: tableIds }, restaurant: restaurantId });

    io.to(`restaurant_${restaurantId}`).emit('tables_merged', {
      tableIds,
      mergedLabel,
    });

    res.status(200).json({ success: true, message: 'Tables merged!', tables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Unmerge Tables
export const unmergeTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);
    const { tableIds } = req.body;

    await Table.updateMany(
      { _id: { $in: tableIds }, restaurant: restaurantId },
      { status: 'available', mergedWith: [], mergedLabel: '' }
    );

    io.to(`restaurant_${restaurantId}`).emit('tables_unmerged', { tableIds });

    res.status(200).json({ success: true, message: 'Tables unmerged!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Regenerate QR Code
export const regenerateQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);

    const table = await Table.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
      isActive: true,
    });

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found' });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId).select('slug name');
    if (!restaurant || !restaurant.slug) {
      res.status(400).json({
        success: false,
        message: 'Restaurant slug not found.',
      });
      return;
    }

    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
      res.status(500).json({
        success: false,
        message: 'CLIENT_URL is not configured in environment.',
      });
      return;
    }

    const customerUrl = getCustomerTableUrl(
      clientUrl,
      restaurant.slug,
      table._id.toString()
    );

    const qrCodeBase64 = await QRCode.toDataURL(customerUrl);

    table.qrCode = customerUrl;
    table.qrCodeUrl = qrCodeBase64;
    await table.save();

    res.status(200).json({ success: true, message: 'QR regenerated!', table });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Table
export const deleteTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = getRestaurantId(req);

    await Table.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { isActive: false }
    );

    io.to(`restaurant_${restaurantId}`).emit('table_deleted', { tableId: req.params.id });

    res.status(200).json({ success: true, message: 'Table deleted!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};