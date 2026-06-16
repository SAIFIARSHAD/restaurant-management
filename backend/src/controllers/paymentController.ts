import { Request, Response } from 'express';
import crypto from 'crypto';
import razorpay from '../services/razorpayService';
import Payment from '../models/Payment';

// Step 1 — Order Create + DB Save
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', restaurantId } = req.body;
    const userId = (req as any).user._id;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount required' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    // Save in DB 
    await Payment.create({
      orderId: order.id,
      amount,
      currency,
      status: 'created',
      restaurantId,
      userId,
    });

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 2 — Verify + DB Update
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Verified — DB update
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'verified',
      }
    );

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 3 — Get All Payments (Admin)
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
