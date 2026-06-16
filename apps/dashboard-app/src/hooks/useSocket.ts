import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

let socketInstance: Socket | null = null;

export const getSocket = () => socketInstance;

export const useSocket = () => {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user?.restaurant) return;
    if (initialized.current) return;

        if (!socketInstance) {
      socketInstance = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    initialized.current = true;

    socketInstance.emit('join_restaurant', user.restaurant);

    socketInstance.on('connect', () => {
      socketInstance?.emit('join_restaurant', user.restaurant);
    });

    return () => {
      socketInstance?.off('connect');
      initialized.current = false;
    };
  }, [user?.restaurant]);

  
  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketInstance?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (...args: unknown[]) => void) => {
    socketInstance?.off(event, handler);
  }, []);

  return { on, off };
};