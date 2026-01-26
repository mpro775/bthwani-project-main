import { useCallback, useState } from "react";
import { OrdersApi, type OrdersFilters } from "../services/ordersApi";
import type { OrderRow } from "../types";
import { cleanFilters } from "../utils/query";

export function useOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (filters: OrdersFilters) => {
    setLoading(true); setError(null);
    try {
      const data = await OrdersApi.list(cleanFilters(filters));
      setRows(data);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في جلب الطلبات");
    } finally {
      setLoading(false);
    }
  }, []);

  return { rows, setRows, loading, error, fetchOrders };
}
