// مطابق لـ app-user ArabonMyListScreen
import { useState, useEffect, useCallback } from "react";
import { getMyArabon, getArabonStats } from "../api";
import type { ArabonItem, ArabonStats } from "../types";

export function useArabonMyList(limit = 25) {
  const [items, setItems] = useState<ArabonItem[]>([]);
  const [stats, setStats] = useState<ArabonStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const [listRes, statsRes] = await Promise.all([
        getMyArabon({ cursor, limit }),
        getArabonStats("my"),
      ]);

      const list = listRes?.items ?? listRes?.data ?? [];

      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }
      setStats(statsRes);
      setNextCursor(listRes.nextCursor);
      setHasMore(listRes.hasMore ?? !!listRes.nextCursor);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل عربوناتك";
      setError(errorMessage);
      console.error("خطأ في تحميل عربوناتي:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [loadingMore, hasMore, nextCursor, loadItems]);

  const refresh = useCallback(() => {
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
    loadItems(undefined, false);
  }, [loadItems]);

  useEffect(() => {
    loadItems(undefined, false);
  }, [loadItems]);

  return {
    items,
    stats,
    loading,
    loadingMore,
    hasMore,
    error,
    nextCursor,
    loadMore,
    refresh,
  };
}
