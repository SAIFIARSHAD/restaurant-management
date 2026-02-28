export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        restaurantId: string;
        role: string;
      };
    }
  }
}
