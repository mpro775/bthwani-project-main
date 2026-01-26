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
 * استخراج مصفوفة من استجابة API
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
 * التحقق من نجاح العملية دون بيانات
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


