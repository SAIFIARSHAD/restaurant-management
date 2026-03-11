import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

const getAction = (method: string): string => {
  switch (method) {
    case 'POST':   return 'CREATE';
    case 'PUT':
    case 'PATCH':  return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default:       return 'VIEW';
  }
};

const getModule = (url: string): string => {
  if (url.includes('/orders'))     return 'Order';
  if (url.includes('/bills'))      return 'Bill';
  if (url.includes('/menu'))       return 'Menu';
  if (url.includes('/tables'))     return 'Table';
  if (url.includes('/inventory'))  return 'Inventory';
  if (url.includes('/payroll'))    return 'Payroll';
  if (url.includes('/expenses'))   return 'Expense';
  if (url.includes('/employees'))  return 'Employee';
  if (url.includes('/auth'))       return 'Auth';
  return 'General';
};

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  // Only log mutating requests
  if (req.method === 'GET') return next();

  const originalJson = res.json.bind(res);

  res.json = function (body) {
    
    const user = (req as any).user;

    if (user) {
      AuditLog.create({
        restaurant: user.restaurantId,
        user: user.id,
        userName: user.name,
        role: user.role,
        action: getAction(req.method),
        module: getModule(req.originalUrl),
        description: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip || req.socket.remoteAddress,
        statusCode: res.statusCode
      }).catch((err) => console.error('Audit log failed:', err)); 
    }

    return originalJson(body);
  };

  next();
};
