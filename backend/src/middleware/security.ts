import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// General API Limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const used = (req as any).rateLimit?.used || 100;
    const remaining = (req as any).rateLimit?.remaining || 0;

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again after 15 minutes',
      attemptsUsed: used,
      attemptsRemaining: remaining,
      retryAfter: '15 minutes'
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  //skip: () => false,
  //keyGenerator: (req) => req.ip || 'unknown',

  
  requestPropertyName: 'rateLimit',

  handler: (req: any, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
      attemptsUsed: 5,
      attemptsRemaining: 0,
      retryAfter: '15 minutes'
    });
  }
});

// Security Middlewares 
export const helmetConfig = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

export const hppProtect = hpp();

// Manual NoSQL Injection Sanitizer 
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          obj[key] = sanitizeObject(obj[key]);
        }
      });
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query) as any;
  next();
};
