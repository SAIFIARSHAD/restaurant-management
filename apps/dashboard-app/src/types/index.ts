export type UserRole = 
  | "superadmin" 
  | "admin" 
  | "manager" 
  | "cashier" 
  | "kitchen" 
  | "waiter" 
  | "delivery";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
