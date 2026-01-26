// src/features/kenz/hooks/useKenzList.ts
import { useState, useEffect, useCallback } from 'react';
import { getKenzList } from '../api';
import type { KenzItem, KenzFilters } from '../types';

interface UseKenzListOptions {
  initialFilters?: KenzFilters;
  limit?: number;
}

export function useKenzList(options: UseKenzListOptions = {}) {
  const { initialFilters = {}, limit = 20 } = options;

  const [items, setItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KenzFilters>(initialFilters);

  const loadItems = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params: any = { limit };

      // تطبيق الفلاتر
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
      if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;

      if (loadMore && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getKenzList(params);

      if (loadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor && response.items.length === limit);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل الإعلانات';
      setError(errorMessage);
      console.error('خطأ في تحميل كنز:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit, nextCursor]);

  // تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<KenzFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // إعادة تعيين الفلاتر
  const resetFilters = useCallback(() => {
    setFilters({});
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  // تحميل المزيد
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadItems(true);
    }
  }, [loadingMore, hasMore, loadItems]);

  // إعادة تحميل
  const refresh = useCallback(() => {
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
    loadItems(false);
  }, [loadItems]);

  // تحديث عنصر في القائمة
  const updateItem = useCallback((updatedItem: KenzItem) => {
    setItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
  }, []);

  // حذف عنصر من القائمة
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // إضافة عنصر جديد للقائمة
  const addItem = useCallback((newItem: KenzItem) => {
    setItems(prev => [newItem, ...prev]);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
