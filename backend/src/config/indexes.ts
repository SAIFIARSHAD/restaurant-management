import mongoose from 'mongoose';

export const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    // Orders
    await db.collection('orders').createIndexes([
      { key: { restaurant: 1, status: 1 } },
      { key: { restaurant: 1, createdAt: -1 } },
      //{ key: { orderNumber: 1 }, unique: true, sparse: true }
    ]);

    // Bills
    await db.collection('bills').createIndexes([
      { key: { restaurant: 1, paymentStatus: 1 } },
      { key: { restaurant: 1, createdAt: -1 } },
      //{ key: { billNumber: 1 }, unique: true, sparse: true }
    ]);

    // Menu Items
    await db.collection('menuitems').createIndexes([
      { key: { restaurant: 1, category: 1 } },
      { key: { restaurant: 1, isAvailable: 1 } }
    ]);

    // Tables
    await db.collection('tables').createIndexes([
      { key: { restaurant: 1, status: 1 } },
      { key: { restaurant: 1, tableNumber: 1 } }
    ]);

    // Expenses
    await db.collection('expenses').createIndexes([
      { key: { restaurant: 1, date: -1 } },
      { key: { restaurant: 1, category: 1 } }
    ]);

    // Employees
    await db.collection('employees').createIndexes([
      { key: { restaurant: 1, isActive: 1 } }
    ]);

    // Audit Logs
    await db.collection('auditlogs').createIndexes([
      { key: { restaurant: 1, createdAt: -1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 90 * 24 * 60 * 60 }
    ]);

    console.log('MongoDB Indexes created successfully!');
  } catch (error) {
    console.error('Index creation failed:', error);
  }
};
