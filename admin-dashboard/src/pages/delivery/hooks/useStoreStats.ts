// src/hooks/useStoreStats.ts
import { useState, useEffect } from "react";
import axios from "../../../utils/axios";

export type Period = "daily" | "weekly" | "monthly" | "all";
export interface StoreStats {
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
}

export function useStoreStats(storeId: string, period: Period) {
  const [stats, setStats] = useState<StoreStats>({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    axios
      .get<StoreStats>(`/delivery/stores/${storeId}/stats/${period}`)
      .then((res) => {
        setStats(res.data);
        setError(null);
      })
      .catch(() => setError("فشل في تحميل الإحصائيات"))
      .finally(() => setLoading(false));
  }, [storeId, period]);

  return { stats, loading, error };
}
