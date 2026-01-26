// src/api/client.ts  (مثال)
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { ERROR_MAP } from "../utils/errorMap";
import type { ApiResponse } from "../types/api";

const API_BASE =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://api.bthwani.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// optional: still keep interceptor that reads SecureStore (fallback)
api.interceptors.request.use(async (config) => {
  // إذا الهيدر موجود بالفعل، لا نقرأ SecureStore ثانياً (تسريع)
  if (!config.headers?.Authorization) {
    const token = await SecureStore.getItemAsync("mk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor لمعالجة الأخطاء الموحّدة
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // طباعة تفاصيل الخطأ للتطوير
    if (__DEV__) {
      const apiError = error?.response?.data as ApiResponse;
      if (apiError?.error) {
        console.error(`[API Error ${apiError.error.code}]`, {
          message: apiError.error.message,
          userMessage: apiError.error.userMessage,
          suggestedAction: apiError.error.suggestedAction,
          details: apiError.error.details,
        });
      }
    }

    const status = error?.response?.status;
    const code = error?.response?.data?.error?.code;

    if (code && ERROR_MAP[code]) {
      const userMessage = error?.response?.data?.error?.userMessage || ERROR_MAP[code].message;
      console.warn(`[${code}] ${userMessage}`);

      if (typeof window !== 'undefined') {
        alert(`${ERROR_MAP[code].title}: ${userMessage}`);
      }
    }
    return Promise.reject(error);
  }
);

// تحسين setAuthToken ليحدّث axios.defaults فوراً
export async function setAuthToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync("mk_token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await SecureStore.deleteItemAsync("mk_token");
    delete api.defaults.headers.common.Authorization;
  }
}
