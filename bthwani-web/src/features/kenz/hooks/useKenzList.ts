// مطابق لـ app-user - دعم الفلترة حسب الفئة والمدينة
import { useState, useEffect, useCallback } from "react";
import { getKenzList } from "../api";
import type { KenzItem, KenzListResponse } from "../types";

interface UseKenzListOptions {
  initialCategory?: string | undefined;
  initialCity?: string | undefined;
  limit?: number;
}

export function useKenzList(options: UseKenzListOptions = {}) {
  const { initialCategory, initialCity, limit = 20 } = options;

  const [items, setItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory
  );
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    initialCity
  );

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response: KenzListResponse = await getKenzList({
          cursor,
          limit,
          category: selectedCategory,
          city: selectedCity,
        });
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
          err instanceof Error ? err.message : "فشل في تحميل الإعلانات";
        setError(errorMessage);
        console.error("خطأ في تحميل كنز:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, selectedCity, limit]
  );

  const updateFilters = useCallback(
    (updates: { category?: string | undefined; city?: string | undefined }) => {
      if (updates.category !== undefined) setSelectedCategory(updates.category);
      if (updates.city !== undefined) setSelectedCity(updates.city);
    },
    []
  );

  const handleCategoryChange = useCallback((category: string | undefined) => {
    setSelectedCategory(category);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const handleCityChange = useCallback((city: string | undefined) => {
    setSelectedCity(city);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setSelectedCity(undefined);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

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

  const updateItem = useCallback((updatedItem: KenzItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  }, []);

  const addItem = useCallback((newItem: KenzItem) => {
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
    selectedCategory,
    selectedCity,
    updateFilters,
    handleCategoryChange,
    handleCityChange,
    resetFilters,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
