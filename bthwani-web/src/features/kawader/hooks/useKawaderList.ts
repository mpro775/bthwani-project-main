// مطابق لـ app-user — يدعم القائمة العامة، عروضي، والبحث
import { useState, useEffect, useCallback } from "react";
import { getKawaderList, getMyKawader, searchKawader } from "../api";
import type {
  KawaderItem,
  KawaderListResponse,
  KawaderFilters,
} from "../types";

export type ListMode = "all" | "my" | "search";

export function useKawaderList(
  limit = 25,
  options?: { mode?: ListMode; filters?: KawaderFilters }
) {
  const [items, setItems] = useState<KawaderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = options?.mode ?? "all";
  const filters = options?.filters ?? {};
  const searchQ = filters.search?.trim();

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        let response: KawaderListResponse;

        if (mode === "my") {
          response = await getMyKawader({ cursor, limit });
        } else if (searchQ) {
          response = await searchKawader({
            q: searchQ,
            cursor,
            limit,
            status: filters.status,
            offerType: filters.offerType,
            jobType: filters.jobType,
            location: filters.location,
            budgetMin: filters.budgetMin,
            budgetMax: filters.budgetMax,
          });
        } else {
          response = await getKawaderList({
            cursor,
            limit,
            status: filters.status,
            offerType: filters.offerType,
            jobType: filters.jobType,
            location: filters.location,
          });
        }

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
    },
    [limit, mode, searchQ, filters.status, filters.offerType, filters.jobType, filters.location, filters.budgetMin, filters.budgetMax]
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
