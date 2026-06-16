import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        restaurantId: string;
        restaurant?: any;
        role: string;
        name: string;
        email: string;
      };
    }
  }
}

export {};
