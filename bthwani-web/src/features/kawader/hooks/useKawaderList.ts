// src/features/kawader/hooks/useKawaderList.ts
import { useState, useEffect, useCallback } from 'react';
import { getKawaderList } from '../api';
import type { KawaderItem, KawaderFilters } from '../types';

interface UseKawaderListOptions {
  initialFilters?: KawaderFilters;
  limit?: number;
}

export function useKawaderList(options: UseKawaderListOptions = {}) {
  const { initialFilters = {}, limit = 20 } = options;

  const [items, setItems] = useState<KawaderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KawaderFilters>(initialFilters);

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
      if (filters.budgetMin !== undefined) params.budgetMin = filters.budgetMin;
      if (filters.budgetMax !== undefined) params.budgetMax = filters.budgetMax;

      if (loadMore && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getKawaderList(params);

      if (loadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor && response.items.length === limit);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل العروض الوظيفية';
      setError(errorMessage);
      console.error('خطأ في تحميل كوادر:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit, nextCursor]);

  // تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<KawaderFilters>) => {
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
  const updateItem = useCallback((updatedItem: KawaderItem) => {
    setItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
  }, []);

  // حذف عنصر من القائمة
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // إضافة عنصر جديد للقائمة
  const addItem = useCallback((newItem: KawaderItem) => {
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
