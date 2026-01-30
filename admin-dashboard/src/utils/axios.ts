import axios from "axios";
import { ERROR_MAP } from "./errorMap";
import type { ApiResponse } from "../types/api";

// قراءة متغير البيئة أو استخدام قيمة افتراضية
const getBaseURL = () => {
  // في التطوير: استخدم متغير البيئة أو localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  }
  // في الإنتاج: استخدم متغير البيئة أو قيمة ثابتة آمنة
  return import.meta.env.VITE_API_URL || "https://api-bthwani.smartagency-ye.com/api/v1";
};

// Axios instance
const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor آمن وحديث
instance.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor لمعالجة الأخطاء الموحّدة
instance.interceptors.response.use(
  (res) => {
    // التحقق من البنية الجديدة
    return res;
  },
  async (error) => {
    // طباعة تفاصيل الخطأ للتطوير
    if (import.meta.env.DEV) {
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

    const code = error?.response?.data?.error?.code;

    if (code && ERROR_MAP[code]) {
      // هنا اعرض Toast/Modal حسب نظام التنبيهات لديك
      console.warn(`[${code}] ${ERROR_MAP[code].message}`);

      // مثال: عرض رسالة خطأ للمستخدم
      // يمكنك استبدال هذا بنظام التنبيهات الخاص بك
      if (typeof window !== 'undefined') {
        const userMessage = error?.response?.data?.error?.userMessage || ERROR_MAP[code].message;
        const title = ERROR_MAP[code].title;
        // في React: استخدم toast أو modal
        // toast.error(userMessage, { title });
        alert(`${title}: ${userMessage}`);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
