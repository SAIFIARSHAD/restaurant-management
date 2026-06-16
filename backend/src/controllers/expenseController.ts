import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import ExpenseCategory from '../models/ExpenseCategory';

// ADD CATEGORY
export const addCategory = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { name, description } = req.body;

    const existing = await ExpenseCategory.findOne({
      restaurant: restaurantId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await ExpenseCategory.create({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      name,
      description,
    });

    res.status(201).json({ success: true, message: 'Category added', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET ALL CATEGORIES
export const getCategories = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;

    const categories = await ExpenseCategory.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ADD EXPENSE
export const addExpense = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    //const userId = (req as any).user._id as string;
    const userId = (req as any).user.id || (req as any).user._id;
    const { category, title, amount, date, paymentMethod, note } = req.body;

    const expense = await Expense.create({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      category: new mongoose.Types.ObjectId(category),
      title,
      amount,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'cash' || 'Cash',
      note,
      addedBy: new mongoose.Types.ObjectId(userId),
    });

    const populated = await expense.populate('category', 'name');

    res.status(201).json({ success: true, message: 'Expense added', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET ALL EXPENSES
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { category, startDate, endDate, paymentMethod } = req.query;

    const filter: any = { restaurant: new mongoose.Types.ObjectId(restaurantId) };

    if (category) filter.category = new mongoose.Types.ObjectId(category as string);
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(filter)
      .populate('category', 'name')
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount: total,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// UPDATE EXPENSE
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const id = req.params.id as string;

    const expense = await Expense.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), restaurant: new mongoose.Types.ObjectId(restaurantId) },
      { $set: req.body },
      { new: true }
    ).populate('category', 'name');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, message: 'Expense updated', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// DELETE EXPENSE
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const id = req.params.id as string;

    const expense = await Expense.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// MONTHLY REPORT
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { month, year } = req.query;

    const m = parseInt(month as string) || new Date().getMonth() + 1;
    const y = parseInt(year as string) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'expensecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { totalAmount: -1 } },
    ]);

    const grandTotal = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

    res.status(200).json({
      success: true,
      month: m,
      year: y,
      grandTotal,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
// PROFIT CALCULATION 
export const getProfitReport = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId as string;
    const { month, year } = req.query;

    const m = parseInt(month as string) || new Date().getMonth() + 1;
    const y = parseInt(year as string) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    // Total Expenses
    const expenseResult = await Expense.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpense = expenseResult[0]?.total || 0;

    // Total Revenue
    const Bill = mongoose.model('Bill');
    const revenueResult = await Bill.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid',     
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }, 
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const profit = totalRevenue - totalExpense;

    res.status(200).json({
      success: true,
      month: m,
      year: y,
      data: {
        totalRevenue,
        totalExpense,
        profit,
        profitMargin: totalRevenue > 0
          ? `${((profit / totalRevenue) * 100).toFixed(2)}%`
          : '0%',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
