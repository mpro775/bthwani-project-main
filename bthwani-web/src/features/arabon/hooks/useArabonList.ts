// مطابق لـ app-user ArabonListScreen
import { useState, useEffect, useCallback } from "react";
import { getArabonList } from "../api";
import type { ArabonItem, ArabonStatus } from "../types";

interface UseArabonListOptions {
  statusFilter?: ArabonStatus | "";
  limit?: number;
}

export function useArabonList(options: UseArabonListOptions = {}) {
  const { statusFilter = "", limit = 25 } = options;

  const [items, setItems] = useState<ArabonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response = await getArabonList({
          cursor,
          status: statusFilter || undefined,
          limit,
        });
        const list = response?.items ?? response?.data ?? [];

        if (isLoadMore) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }

        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore ?? !!response.nextCursor);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "فشل في تحميل العربونات";
        setError(errorMessage);
        console.error("خطأ في تحميل العربونات:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, limit]
  );

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

  const updateItem = useCallback((updatedItem: ArabonItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  }, []);

  const addItem = useCallback((newItem: ArabonItem) => {
    setItems((prev) => [newItem, ...prev]);
  }, []);

  useEffect(() => {
    loadItems(undefined, false);
  }, [loadItems]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    nextCursor,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
