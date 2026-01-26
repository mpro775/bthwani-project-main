/**
 * useAdminAPI Hook
 * Hook موحد لاستدعاء جميع Admin Endpoints
 */

import { useState, useCallback } from 'react';
import type { AdminEndpoint } from '@/config/admin-endpoints';
import { buildEndpointUrl } from '@/config/admin-endpoints';
import axiosInstance from '../utils/axios';

interface UseAdminAPIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

interface CallEndpointConfig {
  params?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

export function useAdminAPI(options?: UseAdminAPIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  /**
   * استدعاء endpoint محدد
   */
  const callEndpoint = useCallback(
    async <T = any>(
      endpoint: AdminEndpoint,
      config?: CallEndpointConfig
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        // بناء URL
        let url = buildEndpointUrl(endpoint, config?.params);

        // إضافة query parameters
        if (config?.query) {
          const queryString = new URLSearchParams(config.query).toString();
          url += (url.includes('?') ? '&' : '?') + queryString;
        }

        // استدعاء API
        const response = await axiosInstance.request({
          method: endpoint.method,
          url,
          data: config?.body,
          headers: config?.headers,
        });

        setData(response.data);
        options?.onSuccess?.(response.data);

        // رسالة نجاح (اختياري)
        if (options?.showSuccessMessage) {
          console.log(`✅ ${endpoint.summary} - نجح`);
        }

        return response.data;
      } catch (err: any) {
        const errorObj = err as Error;
        setError(errorObj);
        options?.onError?.(err);

        // رسالة خطأ (اختياري)
        if (options?.showErrorMessage) {
          console.error(`❌ ${endpoint.summary} - فشل:`, err.message);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  /**
   * إعادة تعيين الحالة
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    callEndpoint,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook متخصص للـ GET requests مع caching
 */
export function useAdminQuery<T = any>(
  endpoint: AdminEndpoint,
  config?: CallEndpointConfig,
  options?: UseAdminAPIOptions & { enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    setLoading(true);
    setError(null);

    try {
      let url = buildEndpointUrl(endpoint, config?.params);

      if (config?.query) {
        const queryString = new URLSearchParams(config.query).toString();
        url += (url.includes('?') ? '&' : '?') + queryString;
      }

      const response = await axiosInstance.request({
        method: endpoint.method,
        url,
        headers: config?.headers,
      });

      setData(response.data);
      options?.onSuccess?.(response.data);

      return response.data;
    } catch (err: any) {
      const errorObj = err as Error;
      setError(errorObj);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, config, options]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook متخصص للـ POST/PATCH/DELETE requests
 */
export function useAdminMutation<TData = any, TVariables = any>(
  endpoint: AdminEndpoint,
  options?: UseAdminAPIOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables, config?: CallEndpointConfig): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        let url = buildEndpointUrl(endpoint, config?.params);

        if (config?.query) {
          const queryString = new URLSearchParams(config.query).toString();
          url += (url.includes('?') ? '&' : '?') + queryString;
        }

        const response = await axiosInstance.request({
          method: endpoint.method,
          url,
          data: variables || config?.body,
          headers: config?.headers,
        });

        setData(response.data);
        options?.onSuccess?.(response.data);

        return response.data;
      } catch (err: any) {
        const errorObj = err as Error;
        setError(errorObj);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Type-safe helper للحصول على endpoint بواسطة ID
 */
export function useEndpoint(
  _endpointId: string) {
  // يمكن تحسين هذا لاحقاً بإضافة caching
  return null; // placeholder
}

