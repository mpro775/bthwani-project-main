// مطابق لـ app-user - بدون فلاتر، cursor فقط
import { useState, useEffect, useCallback } from "react";
import { getSanadList } from "../api";
import type { SanadItem, SanadListResponse } from "../types";

export function useSanadList(limit = 25) {
  const [items, setItems] = useState<SanadItem[]>([]);
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

      const response: SanadListResponse = await getSanadList({
        cursor,
        limit,
      });
      const list =
        Array.isArray(response?.items) ? response.items : response?.data ?? [];

      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore ?? !!response.nextCursor);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل الطلبات";
      setError(errorMessage);
      console.error("خطأ في تحميل السند:", err);
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
    loading,
    loadingMore,
    hasMore,
    error,
    nextCursor,
    loadMore,
    refresh,
  };
}
