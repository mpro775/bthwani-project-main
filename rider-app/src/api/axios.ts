// utils/axios.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ERROR_MAP } from "../utils/errorMap";
import type { ApiResponse } from "../types/api";

const instance = axios.create({
  baseURL: "https://api.bthwani.com/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    // اقرأ التوكن من SecureStore
    const token = await SecureStore.getItemAsync("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor لمعالجة الأخطاء الموحّدة
instance.interceptors.response.use(
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

export default instance;
