// مطابق لـ app-user - بدون فلاتر، cursor فقط
import { useState, useEffect, useCallback } from "react";
import { getKawaderList } from "../api";
import type { KawaderItem, KawaderListResponse } from "../types";

export function useKawaderList(limit = 25) {
  const [items, setItems] = useState<KawaderItem[]>([]);
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

      const response: KawaderListResponse = await getKawaderList({
        cursor,
        limit,
      });
      const list =
        Array.isArray(response?.data) ? response.data : response?.items ?? [];

      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore ?? !!response.nextCursor);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل العروض الوظيفية";
      setError(errorMessage);
      console.error("خطأ في تحميل الكوادر:", err);
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
