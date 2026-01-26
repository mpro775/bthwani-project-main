// src/features/arabon/hooks/useArabonList.ts
import { useState, useEffect, useCallback } from 'react';
import { getArabonList } from '../api';
import type { ArabonItem, ArabonFilters } from '../types';

interface UseArabonListOptions {
  initialFilters?: ArabonFilters;
  limit?: number;
}

export function useArabonList(options: UseArabonListOptions = {}) {
  const { initialFilters = {}, limit = 20 } = options;

  const [items, setItems] = useState<ArabonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ArabonFilters>(initialFilters);

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
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      if (loadMore && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getArabonList(params);

      if (loadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor && response.items.length === limit);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل العربونات';
      setError(errorMessage);
      console.error('خطأ في تحميل عربونات:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit, nextCursor]);

  // تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<ArabonFilters>) => {
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
  const updateItem = useCallback((updatedItem: ArabonItem) => {
    setItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
  }, []);

  // حذف عنصر من القائمة
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // إضافة عنصر جديد للقائمة
  const addItem = useCallback((newItem: ArabonItem) => {
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
