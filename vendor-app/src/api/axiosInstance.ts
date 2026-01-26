import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ERROR_MAP } from "../utils/errorMap";
import type { ApiResponse } from "../types/api";

// قراءة متغير البيئة من app.json أو استخدام قيمة افتراضية
const getBaseURL = () => {
  try {
    // في Expo، يمكننا الوصول للمتغيرات من Constants.expoConfig.extra
    const Constants = require('expo-constants');
    const apiUrls = Constants.default?.expoConfig?.extra?.apiUrl;

    if (__DEV__) {
      return apiUrls?.development || "http://localhost:3000/api/v1";
    } else {
      return apiUrls?.production || "https://bthwani-backend-9u4r.onrender.com/api/v1";
    }
  } catch {
    // في حالة عدم توفر Constants، استخدم قيمة افتراضية
    return __DEV__
      ? "http://localhost:3000/api/v1"
      : "https://bthwani-backend-9u4r.onrender.com/api/v1";
  }
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// أضف هذا Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    console.log("Token from AsyncStorage:", token);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor لمعالجة الأخطاء الموحّدة
axiosInstance.interceptors.response.use(
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
      // هنا اعرض Toast/Modal حسب نظام التنبيهات لديك
      const userMessage = error?.response?.data?.error?.userMessage || ERROR_MAP[code].message;
      console.warn(`[${code}] ${userMessage}`);

      // مثال: عرض رسالة خطأ للمستخدم
      // يمكنك استبدال هذا بنظام التنبيهات الخاص بك (مثل react-native-toast-message)
      if (typeof window !== 'undefined') {
        // في React Native: استخدم toast أو alert
        alert(`${ERROR_MAP[code].title}: ${userMessage}`);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
