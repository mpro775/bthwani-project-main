/**
 * مساعدات للتعامل مع API Response الجديد
 * يمكن استخدامها في جميع ملفات الـ API
 */

import type { ApiResponse } from "../types/api";
import type { AxiosResponse } from "axios";

/**
 * استخراج البيانات من استجابة API بشكل آمن
 * يرمي خطأ إذا فشل الطلب
 */
export function extractApiData<T>(
  response: AxiosResponse<ApiResponse<T>>,
  errorMessage = "فشل في تحميل البيانات"
): T {
  const apiResponse = response.data;
  
  if (!apiResponse.success) {
    const error = apiResponse.error;
    throw new Error(
      error?.userMessage || error?.message || errorMessage
    );
  }

  if (apiResponse.data === undefined || apiResponse.data === null) {
    throw new Error(errorMessage);
  }

  return apiResponse.data;
}

/**
 * استخراج البيانات من استجابة API (يمكن أن تكون null)
 * يرمي خطأ فقط إذا success = false
 */
export function extractApiDataOptional<T>(
  response: AxiosResponse<ApiResponse<T>>,
  errorMessage = "فشل في العملية"
): T | undefined {
  const apiResponse = response.data;
  
  if (!apiResponse.success) {
    const error = apiResponse.error;
    throw new Error(
      error?.userMessage || error?.message || errorMessage
    );
  }

  return apiResponse.data;
}

/**
 * استخراج مصفوفة من استجابة API
 * يرجع مصفوفة فارغة إذا لم تكن موجودة
 */
export function extractApiArray<T>(
  response: AxiosResponse<ApiResponse<T[]>>,
  errorMessage = "فشل في تحميل البيانات"
): T[] {
  const apiResponse = response.data;
  
  if (!apiResponse.success) {
    const error = apiResponse.error;
    throw new Error(
      error?.userMessage || error?.message || errorMessage
    );
  }

  return apiResponse.data || [];
}

/**
 * استخراج Pagination من استجابة API
 */
export function extractPagination(
  response: AxiosResponse<ApiResponse<any>>
) {
  return response.data.pagination;
}

/**
 * التحقق من نجاح العملية دون بيانات
 * يستخدم للعمليات مثل DELETE
 */
export function checkApiSuccess(
  response: AxiosResponse<ApiResponse<void>>,
  errorMessage = "فشلت العملية"
): void {
  const apiResponse = response.data;
  
  if (!apiResponse.success) {
    const error = apiResponse.error;
    throw new Error(
      error?.userMessage || error?.message || errorMessage
    );
  }
}

/**
 * التعامل مع Response قديم (للتوافق العكسي)
 * يتحقق إذا كانت البيانات بالبنية القديمة أو الجديدة
 */
export function extractDataLegacy<T>(
  response: AxiosResponse<T | ApiResponse<T>>,
  errorMessage = "فشل في تحميل البيانات"
): T {
  const data = response.data as any;
  
  // إذا كانت البنية الجديدة
  if (data && typeof data === 'object' && 'success' in data) {
    const apiResponse = data as ApiResponse<T>;
    
    if (!apiResponse.success) {
      const error = apiResponse.error;
      throw new Error(
        error?.userMessage || error?.message || errorMessage
      );
    }
    
    if (apiResponse.data === undefined || apiResponse.data === null) {
      throw new Error(errorMessage);
    }
    
    return apiResponse.data;
  }
  
  // إذا كانت البنية القديمة (البيانات مباشرة)
  return data as T;
}

/**
 * Wrapper لطلبات GET
 */
export async function apiGet<T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  errorMessage?: string
): Promise<T> {
  const response = await requestFn();
  return extractApiData(response, errorMessage);
}

/**
 * Wrapper لطلبات POST/PUT/PATCH
 */
export async function apiMutate<T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  errorMessage?: string
): Promise<T> {
  const response = await requestFn();
  return extractApiData(response, errorMessage);
}

/**
 * Wrapper لطلبات DELETE
 */
export async function apiDelete(
  requestFn: () => Promise<AxiosResponse<ApiResponse<void>>>,
  errorMessage?: string
): Promise<void> {
  const response = await requestFn();
  checkApiSuccess(response, errorMessage);
}

/**
 * Wrapper لطلبات GET التي ترجع مصفوفة
 */
export async function apiGetArray<T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T[]>>>,
  errorMessage?: string
): Promise<T[]> {
  const response = await requestFn();
  return extractApiArray(response, errorMessage);
}


