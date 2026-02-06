import { useState, useCallback, useEffect } from "react";
import { getKenzFavorites } from "../api";
import type { KenzItem } from "../types";

export function useKenzFavorites() {
  const [items, setItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      const response = await getKenzFavorites({ cursor });
      const list = response?.items ?? [];
      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل في تحميل المفضلة";
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) loadItems(nextCursor, true);
  }, [loadingMore, hasMore, nextCursor, loadItems]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  }, []);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    nextCursor,
    error,
    loadMore,
    refresh: () => loadItems(),
    removeItem,
  };
}
