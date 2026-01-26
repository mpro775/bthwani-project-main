// src/features/maarouf/hooks/useMaaroufList.ts
import { useState, useEffect, useCallback } from 'react';
import { getMaaroufList } from '../api';
import type { MaaroufItem, MaaroufFilters } from '../types';

interface UseMaaroufListOptions {
  initialFilters?: MaaroufFilters;
  limit?: number;
}

export function useMaaroufList(options: UseMaaroufListOptions = {}) {
  const { initialFilters = {}, limit = 20 } = options;

  const [items, setItems] = useState<MaaroufItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MaaroufFilters>(initialFilters);

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
      if (filters.kind) params.kind = filters.kind;
      if (filters.status) params.status = filters.status;
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      if (loadMore && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getMaaroufList(params);

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
      console.error('خطأ في تحميل إعلانات معروف:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit, nextCursor]);

  // تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<MaaroufFilters>) => {
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
  const updateItem = useCallback((updatedItem: MaaroufItem) => {
    setItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
  }, []);

  // حذف عنصر من القائمة
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // إضافة عنصر جديد للقائمة
  const addItem = useCallback((newItem: MaaroufItem) => {
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
