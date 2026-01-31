// مطابق لـ app-user ArabonSearchScreen
import { useState, useCallback, useRef, useEffect } from "react";
import { searchArabon } from "../api";
import type { ArabonItem, ArabonStatus } from "../types";

const DEBOUNCE_MS = 400;

export function useArabonSearch(status: ArabonStatus | "" = "") {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ArabonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      const q = query.trim();
      if (!q) {
        if (!isLoadMore) {
          setItems([]);
          setSearched(true);
        }
        return;
      }
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const res = await searchArabon(q, status || undefined, cursor);
        const list = res?.items ?? res?.data ?? [];

        if (isLoadMore) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore ?? !!res.nextCursor);
        setSearched(true);
      } catch (e) {
        console.error("خطأ في البحث:", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, status]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(false);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, status, runSearch]);

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loadingMore) runSearch(nextCursor, true);
  }, [hasMore, nextCursor, loadingMore, runSearch]);

  const refresh = useCallback(() => {
    runSearch();
  }, [runSearch]);

  return {
    query,
    setQuery,
    items,
    loading,
    loadingMore,
    hasMore,
    searched,
    loadMore,
    refresh,
  };
}
