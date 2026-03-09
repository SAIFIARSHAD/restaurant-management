import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Employee from '../models/Employee';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// ADD EMPLOYEE 
export const addEmployee = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const {
      name, email, phone, role,
      salary, salaryType, joiningDate, bankDetails,
      password // employee login password
    } = req.body;

    // Check: email already exists?
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create User account  
    const user = await User.create({
      name,
      email,
      password: password || 'restaurant@123',
      role,
      restaurant: restaurantId,
      isActive: true,
    });

    // Employee record 
    const employee = await Employee.create({
      restaurant: restaurantId,
      name, email, phone, role,
      salary, salaryType,
      joiningDate: new Date(joiningDate),
      bankDetails: bankDetails || {},
      userId: user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      data: { employee, userId: user._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET ALL EMPLOYEES
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;

    const employees = await Employee.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET SINGLE EMPLOYEE
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const employee = await Employee.findOne({
      _id: id,
      restaurant: new mongoose.Types.ObjectId(restaurantId),
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// UPDATE EMPLOYEE 
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, restaurant: new mongoose.Types.ObjectId(restaurantId) },
      { $set: req.body },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// DELETE EMPLOYEE
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    // Not Hard delete  — soft delete (isActive = false)
    const employee = await Employee.findOneAndUpdate(
      { _id: id, restaurant: new mongoose.Types.ObjectId(restaurantId) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // User account deactivate 
    await User.findByIdAndUpdate(employee.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// UPDATE RESTAURANT IP (Admin Only)
export const updateRestaurantIp = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const userId = (req as any).user.id;
    const { ipRange, allowedIp } = req.body;

    const Restaurant = (await import('../models/Restaurant')).default;

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $set: {
          'networkConfig.ipRange': ipRange || '',
          'networkConfig.allowedIp': allowedIp || '',
          'networkConfig.lastUpdated': new Date(),
          'networkConfig.updatedBy': userId,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Restaurant IP updated successfully',
      data: restaurant?.networkConfig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
