import { useEffect, useCallback } from 'react';
import { getKDSOrders, getCompletedOrders } from '../services/kdsApi';
import { useKDSStore } from '../store/kdsStore';

export const useKDSOrders = (stationType?: string) => {
  const {
    orders,
    completedOrders,
    setOrders,
    setCompletedOrders,
    selectedStation,
  } = useKDSStore();

  const station = stationType || selectedStation?.stationType;

  const fetchOrders = useCallback(async () => {
    try {
      const [active, completed] = await Promise.all([
        getKDSOrders(station),
        getCompletedOrders(station),
      ]);
      setOrders(active);
      setCompletedOrders(completed);
    } catch (err) {
      console.error('KDS orders fetch failed:', err);
    }
  }, [station]);

  // Initial fetch + reconnect sync every 30s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, completedOrders, refetch: fetchOrders };
};