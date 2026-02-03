import axios from "axios";
import { ERROR_MAP } from "./errorMap";
import type { ApiResponse } from "../types/api";

// مصدر واحد لعنوان الـ API: تسجيل الدخول وكل الطلبات تستخدمه
// محلياً (npm run dev): يستخدم localhost إلا إذا عرّفت VITE_API_URL
// عند البناء للإنتاج: يستخدم السيرفر الحقيقي إلا إذا عرّفت VITE_API_URL
const PRODUCTION_API = "https://api-bthwani.smartagency-ye.com/api/v1";
const LOCAL_API = "http://localhost:3000/api/v1";
export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? LOCAL_API : PRODUCTION_API);

// Axios instance
const instance = axios.create({
  baseURL: BASE_URL,
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
