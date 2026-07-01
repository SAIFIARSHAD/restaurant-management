import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const raw = localStorage.getItem('kds_session');

  if (raw) {
    try {
      const session = JSON.parse(raw) as {
        user?: { token?: string };
      };

      if (session.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
      }
    } catch {
      // ignore bad session
    }
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kds_session');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;