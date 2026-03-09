import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/Restaurant';

// Check IP range 
const isIpInRange = (ip: string, range: string): boolean => {
  try {
    // Exact IP match
    if (!range.includes('/')) {
      return ip === range;
    }

    // Range match (e.g. 103.45.67.0/24)
    const [subnet, bits] = range.split('/');
    const mask = ~(0xffffffff >>> parseInt(bits)) >>> 0;

    const ipNum = ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
    const subnetNum = subnet.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;

    return (ipNum & mask) === (subnetNum & mask);
  } catch {
    return false;
  }
};

// Request to find actual IP 
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }

  let ip = req.socket.remoteAddress || '';

  if (ip === '::1') ip = '127.0.0.1';

  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

  return ip;
};

// Middleware
export const checkRestaurantIp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const clientIp = getClientIp(req);

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { ipRange, allowedIp } = restaurant.networkConfig || {};

    if (!ipRange && !allowedIp) {
      return next();
    }

    // IP Range check
    if (ipRange && isIpInRange(clientIp, ipRange)) {
      return next();
    }

    // Exact IP check (fallback)
    if (allowedIp && clientIp === allowedIp) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Attendance only allowed from restaurant network. Your IP: ${clientIp}`,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'IP check failed', error });
  }
};
