import api from './api';
import type { KDSUser } from '../types/kds.types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: KDSUser;
}

export const loginKDS = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/auth/login', payload);
  return res.data;
};