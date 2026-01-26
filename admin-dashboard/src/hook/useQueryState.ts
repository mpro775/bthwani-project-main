// src/hook/useQueryState.ts
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook للحفظ والقراءة من QueryString
 * يحفظ حالة التطبيق في URL لإمكانية المشاركة والعودة
 */
export function useQueryState<T>(
  key: string,
  defaultValue: T,
  serialize?: (value: T) => string,
  deserialize?: (value: string) => T
) {
  const navigate = useNavigate();
  const location = useLocation();

  // قراءة القيمة من URL
  const getValueFromURL = useCallback((): T => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(key);

    if (value === null) {
      return defaultValue;
    }

    if (deserialize) {
      try {
        return deserialize(value);
      } catch {
        return defaultValue;
      }
    }

    return value as T;
  }, [location.search, key, defaultValue, deserialize]);

  const [state, setState] = useState<T>(getValueFromURL);

  // تحديث URL عند تغيير الحالة
  const updateURL = useCallback((newValue: T) => {
    const searchParams = new URLSearchParams(location.search);

    if (serialize) {
      if (newValue === defaultValue) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, serialize(newValue));
      }
    } else {
      if (newValue === defaultValue || newValue === '') {
        searchParams.delete(key);
      } else {
        searchParams.set(key, String(newValue));
      }
    }

    const newSearch = searchParams.toString();
    const newURL = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    navigate(newURL, { replace: true });
  }, [navigate, location.pathname, location.search, key, defaultValue, serialize]);

  // تحديث الحالة والـ URL
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const actualValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(state)
      : newValue;

    setState(actualValue);
    updateURL(actualValue);
  }, [state, updateURL]);

  // مزامنة مع URL عند تغيير الموقع
  useEffect(() => {
    const urlValue = getValueFromURL();
    if (JSON.stringify(urlValue) !== JSON.stringify(state)) {
      setState(urlValue);
    }
  }, [location.search, getValueFromURL, state]);

  return [state, setValue] as const;
}

/**
 * Hook متخصص لحفظ حالة التصفح (صفحة، عدد العناصر، ترتيب، فلاتر)
 */
export function useListQueryState() {
  const [page, setPage] = useQueryState('page', 1, String, Number);
  const [perPage, setPerPage] = useQueryState('per_page', 20, String, Number);
  const [search, setSearch] = useQueryState('q', '');
  const [sort, setSort] = useQueryState('sort', '');
  const [filters, setFilters] = useQueryState<Record<string, any>>('filters', {}, JSON.stringify, JSON.parse);

  return {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    sort,
    setSort,
    filters,
    setFilters,
  };
}

/**
 * Hook لحفظ حالة الصفحة في QueryString للروابط ذهاب وإياب
 */
export function usePageQueryState() {
  const [queryParams, setQueryParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  // تحديث QueryString
  const updateQueryParams = useCallback((newParams: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams(window.location.search);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });

    const newSearch = searchParams.toString();
    const newURL = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    window.history.replaceState({}, '', newURL);
    setQueryParams(Object.fromEntries(searchParams.entries()));
  }, []);

  return [queryParams, updateQueryParams] as const;
}
