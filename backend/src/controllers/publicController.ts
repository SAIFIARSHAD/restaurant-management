import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';
import Table from '../models/Table';
import MenuItem from '../models/MenuItem';
import MenuCategory from '../models/MenuCategory';
import Order from '../models/Order';
import { io } from '../server';
import { emitNewOrder, emitToStation } from '../socket/socketHandler';
import mongoose from 'mongoose';

export const getPublicRestaurantInfo = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).select(
      '_id name slug logo coverImage description address phone email settings openingHours isActive'
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Public restaurant info fetched successfully',
      data: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo: (restaurant as any).logo || '',
        coverImage: (restaurant as any).coverImage || '',
        description: (restaurant as any).description || '',
        address: (restaurant as any).address || '',
        phone: (restaurant as any).phone || '',
        email: (restaurant as any).email || '',
        openingHours: (restaurant as any).openingHours || null,
        currency: (restaurant as any).settings?.currency || 'INR',
        taxRate: (restaurant as any).settings?.taxRate || 0,
        serviceCharge: (restaurant as any).settings?.serviceCharge || 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch restaurant info',
    });
  }
};

export const validatePublicTable = async (req: Request, res: Response) => {
  try {
    const { slug, tableId } = req.params;

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).select('_id name slug logo coverImage settings isActive');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive',
      });
    }

    const table = await Table.findOne({
      _id: tableId,
      restaurant: restaurant._id,
      isActive: true,
    }).select(
      '_id tableNumber capacity floor status qrCode qrCodeUrl isActive mergedWith mergedLabel'
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or inactive',
      });
    }

    if (table.status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'This table is inactive',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Table validated successfully',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          logo: restaurant.logo,
          coverImage: restaurant.coverImage,
          currency: restaurant.settings?.currency || 'INR',
          taxRate: restaurant.settings?.taxRate || 0,
          serviceCharge: restaurant.settings?.serviceCharge || 0,
        },
        table: {
          id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          floor: table.floor,
          status: table.status,
          qrCode: table.qrCode,
          qrCodeUrl: table.qrCodeUrl,
          mergedWith: table.mergedWith,
          mergedLabel: table.mergedLabel,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to validate table',
    });
  }
};

export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).select('_id name slug settings');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive',
      });
    }

    const categories = await MenuCategory.find({
      restaurant: restaurant._id,
      isActive: true,
    })
      .sort({ sortOrder: 1, name: 1 })
      .select('_id name description image sortOrder');

    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      isAvailable: true,
    })
      .populate('category', 'name description image sortOrder isActive')
      .sort({ sortOrder: 1, name: 1 })
      .select(
        '_id name description price discountedPrice image category isVeg isAvailable preparationTime tags customizations sortOrder station'
      );

    const categoryMap = new Map<
  string,
  {
    id: string;
    name: string;
    description?: string;
    image?: string;
    sortOrder: number;
    items: any[];
  }
>(
  categories.map((category) => [
    category._id.toString(),
    {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      items: [],
    },
  ])
);

    const uncategorized: any[] = [];

    for (const item of menuItems) {
      const category = item.category as any;

      const formattedItem = {
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        discountedPrice: item.discountedPrice,
        image: item.image,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        tags: item.tags,
        customizations: item.customizations,
        sortOrder: item.sortOrder,
        station: item.station,
      };

      if (category?._id && categoryMap.has(category._id.toString())) {
        categoryMap.get(category._id.toString())?.items.push(formattedItem);
      } else {
        uncategorized.push(formattedItem);
      }
    }

    const groupedMenu = Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        items: category.items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
      }))
      .filter((category) => category.items.length > 0);

    if (uncategorized.length > 0) {
      groupedMenu.push({
        id: 'uncategorized',
        name: 'Others',
        description: '',
        image: '',
        sortOrder: 9999,
        items: uncategorized.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Public menu fetched successfully',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          currency: restaurant.settings?.currency || 'INR',
          taxRate: restaurant.settings?.taxRate || 0,
          serviceCharge: restaurant.settings?.serviceCharge || 0,
        },
        categories: groupedMenu,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public menu',
    });
  }
};

export const createPublicOrder = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { tableId, items, notes, customerName, customerPhone } = req.body;

    const trimmedName = String(customerName || '').trim();
    const trimmedPhone = String(customerPhone || '').trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Table and items are required',
      });
    }

    if (!trimmedName || !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required',
      });
    }

    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number',
      });
    }

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).select('_id name slug settings');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive',
      });
    }

    const table = await Table.findOne({
      _id: tableId,
      restaurant: restaurant._id,
      isActive: true,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or inactive',
      });
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItemId = item.menuItemId || item.menuItem;
      const quantity = Number(item.quantity || 1);

      if (!menuItemId || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item data',
        });
      }

      const menuItem = await MenuItem.findOne({
        _id: menuItemId,
        restaurant: restaurant._id,
        isAvailable: true,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${menuItemId}`,
        });
      }

      const itemPrice =
        typeof (menuItem as any).discountedPrice === 'number' &&
        (menuItem as any).discountedPrice > 0
          ? (menuItem as any).discountedPrice
          : menuItem.price;

      subtotal += itemPrice * quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: itemPrice,
        quantity,
        notes: item.notes || '',
        station: (menuItem as any).station || 'kitchen',
      });
    }

    const taxRate = Number((restaurant as any).settings?.taxRate || 0);
    const serviceChargeRate = Number((restaurant as any).settings?.serviceCharge || 0);

    const tax = Math.round((subtotal * taxRate / 100) * 100) / 100;
    const serviceCharge = Math.round((subtotal * serviceChargeRate / 100) * 100) / 100;
    const discount = 0;
    const totalAmount = Math.round((subtotal + tax + serviceCharge - discount) * 100) / 100;

    const lastOrder = await Order.findOne({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .select('orderNumber');

    let nextNum = 1;
    if (lastOrder?.orderNumber) {
      const lastNum = parseInt(lastOrder.orderNumber.replace('ORD-', '')) || 0;
      nextNum = lastNum + 1;
    }

    let orderNumber = `ORD-${String(nextNum).padStart(4, '0')}`;

    const exists = await Order.findOne({ orderNumber });
    if (exists) {
      orderNumber = `ORD-${String(nextNum + 1).padStart(4, '0')}`;
    }

    const createdOrder = await Order.create({
      restaurant: restaurant._id,
      table: table._id,
      tableNumber: table.tableNumber,
      orderNumber,
      customerName: trimmedName,
      customerPhone: trimmedPhone,
      items: orderItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      notes: notes || '',
    });

    const order = await Order.findById(createdOrder._id);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: 'Order created but failed to reload order data',
      });
    }

    await Table.findByIdAndUpdate(table._id, { status: 'occupied' });

    emitNewOrder(io, restaurant._id.toString(), {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      customerName: (order as any).customerName,
      customerPhone: (order as any).customerPhone,
      items: order.items,
      notes: order.notes,
      status: order.status,
      createdAt: (order as any).createdAt,
    });

    const stationGroups: Record<string, any[]> = {};

    for (const item of order.items as any[]) {
      const station = item.station || 'kitchen';
      if (!stationGroups[station]) {
        stationGroups[station] = [];
      }
      stationGroups[station].push(item);
    }

    Object.keys(stationGroups).forEach((stationType) => {
      emitToStation(io, restaurant._id.toString(), stationType, 'new_station_order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        customerName: (order as any).customerName,
        customerPhone: (order as any).customerPhone,
        items: stationGroups[stationType],
        notes: order.notes,
        createdAt: (order as any).createdAt,
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

export const getPublicOrderStatus = async (req: Request, res: Response) => {
  try {
    const rawToken = String(req.params.orderToken || '').trim();

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        message: 'Order token is required',
      });
    }

    const normalizedOrderNumber = rawToken.toUpperCase();
    const isObjectId = mongoose.Types.ObjectId.isValid(rawToken);

    const order = await Order.findOne(
      isObjectId
        ? {
            $or: [{ _id: rawToken }, { orderNumber: normalizedOrderNumber }],
          }
        : {
            orderNumber: normalizedOrderNumber,
          }
    )
      .populate('restaurant', 'name slug settings')
      .populate('table', 'tableNumber floor');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const restaurant: any = order.restaurant;
    const table: any = order.table;

    return res.status(200).json({
      success: true,
      message: 'Public order status fetched successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod || null,
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          totalAmount: order.totalAmount,
          notes: order.notes || '',
          servedAt: order.servedAt || null,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map((item: any) => ({
            id: item._id,
            menuItem: item.menuItem,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || '',
            station: item.station || 'kitchen',
          })),
        },
        restaurant: {
          id: restaurant?._id || null,
          name: restaurant?.name || '',
          slug: restaurant?.slug || '',
          currency: restaurant?.settings?.currency || 'INR',
          taxRate: restaurant?.settings?.taxRate || 0,
          serviceCharge: restaurant?.settings?.serviceCharge || 0,
        },
        table: {
          id: table?._id || null,
          tableNumber: table?.tableNumber || '',
          floor: table?.floor || '',
        },
        timeline: {
          isPending: order.status === 'pending',
          isAccepted: ['accepted', 'preparing', 'ready', 'served', 'billed'].includes(order.status),
          isPreparing: ['preparing', 'ready', 'served', 'billed'].includes(order.status),
          isReady: ['ready', 'served', 'billed'].includes(order.status),
          isServed: ['served', 'billed'].includes(order.status),
          isCompleted: order.status === 'billed',
          isCancelled: order.status === 'cancelled',
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch public order status',
    });
  }
};