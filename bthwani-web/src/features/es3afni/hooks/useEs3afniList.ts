// مطابق لـ app-user - مع فلاتر وبلاغاتي
import { useState, useEffect, useCallback } from "react";
import { getEs3afniList, getMyEs3afni } from "../api";
import type { Es3afniItem, Es3afniListResponse, Es3afniFilters } from "../types";

export function useEs3afniList(limit = 25, filters?: Es3afniFilters, tab: "all" | "my" = "all") {
  const [items, setItems] = useState<Es3afniItem[]>([]);
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

      let response: Es3afniListResponse;
      if (tab === "my") {
        response = await getMyEs3afni(cursor);
      } else {
        response = await getEs3afniList({
          cursor,
          limit,
          bloodType: filters?.bloodType,
          status: filters?.status,
          urgency: filters?.urgency,
        });
      }
      const list = response?.items ?? [];

      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل طلبات التبرع";
      setError(errorMessage);
      console.error("خطأ في تحميل اسعفني:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit, tab, filters?.bloodType, filters?.status, filters?.urgency]);

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

  const updateItem = useCallback((updatedItem: Es3afniItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  }, []);

  const addItem = useCallback((newItem: Es3afniItem) => {
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
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
