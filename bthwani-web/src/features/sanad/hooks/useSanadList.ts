// src/features/sanad/hooks/useSanadList.ts
import { useState, useEffect, useCallback } from 'react';
import { getSanadList, getMySanadList, searchSanad } from '../api';
import type { SanadItem, SanadFilters, SanadSearchParams } from '../types';

interface UseSanadListOptions {
  initialFilters?: SanadFilters;
  limit?: number;
  myOnly?: boolean; // لعرض طلبات المستخدم فقط
}

export function useSanadList(options: UseSanadListOptions = {}) {
  const { initialFilters = {}, limit = 20, myOnly = false } = options;

  const [items, setItems] = useState<SanadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SanadFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadItems = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      let response;

      if (searchQuery.trim()) {
        // البحث
        const searchParams: SanadSearchParams = {
          q: searchQuery,
          kind: filters.kind,
          cursor: loadMore ? nextCursor : undefined,
        };
        response = await searchSanad(searchParams);
      } else {
        // قائمة عادية
        const params: any = { limit };

        // تطبيق الفلاتر
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.kind) params.kind = filters.kind;

        if (loadMore && nextCursor) {
          params.cursor = nextCursor;
        }

        if (myOnly) {
          response = await getMySanadList(params);
        } else {
          response = await getSanadList(params);
        }
      }

      if (loadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor && response.items.length === limit);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل طلبات السند';
      setError(errorMessage);
      console.error('خطأ في تحميل السند:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit, nextCursor, searchQuery, myOnly]);

  // تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<SanadFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // إعادة تعيين الفلاتر
  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setItems([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  // البحث
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
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
  const updateItem = useCallback((updatedItem: SanadItem) => {
    setItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
  }, []);

  // حذف عنصر من القائمة
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // إضافة عنصر جديد للقائمة
  const addItem = useCallback((newItem: SanadItem) => {
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
    searchQuery,
    updateFilters,
    resetFilters,
    performSearch,
    loadMore,
    refresh,
    updateItem,
    removeItem,
    addItem,
  };
}
