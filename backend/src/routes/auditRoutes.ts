import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

const router = Router();


router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find({
      restaurant: (req as any).user.restaurantId
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('user', 'name email');

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
