// مطابق لـ app-user - دعم الفلترة حسب الفئة والمدينة
import { useState, useEffect, useCallback } from "react";
import { getKenzList } from "../api";
import type { KenzItem, KenzListResponse, KenzCondition } from "../types";

export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

export type KenzDeliveryOption = 'meetup' | 'delivery' | 'both';

interface UseKenzListOptions {
  initialCategory?: string | undefined;
  initialCity?: string | undefined;
  initialSearch?: string | undefined;
  initialSort?: KenzSortOption;
  initialCondition?: KenzCondition | undefined;
  initialDeliveryOption?: KenzDeliveryOption | undefined;
  limit?: number;
}

export function useKenzList(options: UseKenzListOptions = {}) {
  const { initialCategory, initialCity, initialSearch, initialSort = 'newest', initialCondition, limit = 20 } = options;

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
  const [selectedCondition, setSelectedCondition] = useState<KenzCondition | undefined>(initialCondition);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<KenzDeliveryOption | undefined>(initialDeliveryOption);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(initialSearch);
  const [sortOption, setSortOption] = useState<KenzSortOption>(initialSort);

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
          condition: selectedCondition,
          deliveryOption: selectedDeliveryOption,
          search: searchQuery || undefined,
          sort: sortOption,
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
    [selectedCategory, selectedCity, selectedCondition, selectedDeliveryOption, searchQuery, sortOption, limit]
  );

  const updateFilters = useCallback(
    (updates: { category?: string; city?: string; condition?: KenzCondition; deliveryOption?: KenzDeliveryOption; search?: string; sort?: KenzSortOption }) => {
      if (updates.category !== undefined) setSelectedCategory(updates.category);
      if (updates.city !== undefined) setSelectedCity(updates.city);
      if (updates.condition !== undefined) setSelectedCondition(updates.condition);
      if (updates.deliveryOption !== undefined) setSelectedDeliveryOption(updates.deliveryOption);
      if (updates.search !== undefined) setSearchQuery(updates.search);
      if (updates.sort !== undefined) setSortOption(updates.sort);
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

  const handleConditionChange = useCallback((condition: KenzCondition | undefined) => {
    setSelectedCondition(condition);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const handleDeliveryOptionChange = useCallback((deliveryOption: KenzDeliveryOption | undefined) => {
    setSelectedDeliveryOption(deliveryOption);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const handleSearchChange = useCallback((search: string | undefined) => {
    setSearchQuery(search);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const handleSortChange = useCallback((sort: KenzSortOption) => {
    setSortOption(sort);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setSelectedCity(undefined);
    setSelectedCondition(undefined);
    setSelectedDeliveryOption(undefined);
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
    selectedCondition,
    selectedDeliveryOption,
    searchQuery,
    sortOption,
    updateFilters,
    handleCategoryChange,
    handleCityChange,
    handleConditionChange,
    handleDeliveryOptionChange,
    handleSearchChange,
    handleSortChange,
    resetFilters,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
