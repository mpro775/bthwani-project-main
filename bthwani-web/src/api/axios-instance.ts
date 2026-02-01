import axios from "axios";
import { storage } from "../utils/storage";
import type { ApiResponse } from "../types/api";

const API_URL = "https://api-bthwani.smartagency-ye.com/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  // لو تعتمد كوكيز بالسيرفر (اختياري):
  // withCredentials: true,
});

/** REQUEST
 * لا تعتمد على allowlist هشّة.
 * ببساطة: لو فيه توكن أرفقه، وإلا أرسل الطلب كضيف.
 * (معظم الـ APIs تتجاهل Header إن وُجد، أو تسمح بالضيف بدون Header)
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getIdToken();
    if (token) {
      config.headers = config.headers || {};
      // لا تحقن لو تم تعطيله صراحة
      // @ts-expect-error custom flag
      if (!config.__skipAuthHeader) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** RESPONSE
 * لا تعمل أي Redirect هنا إطلاقًا.
 * اترك إدارة الدخول للـ ProtectedRoute أو Modals “بوابة الأفعال”.
 * خيار: جرّب تحديث التوكن مرّة واحدة ثم أعد المحاولة (إن كان عندك refresh).
 */
let isRefreshing = false;
let pendingQueue: Array<(token?: string) => void> = [];

const flushQueue = (token?: string) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // تحويل الاستجابة إلى البنية الجديدة إذا لزم الأمر
    // الباك إند الجديد يرجع البيانات في response.data
    // لكن axios يضع كل شيء في response.data
    // لذا نحتاج فقط للتأكد من أن البنية صحيحة
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config || {};
    
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

    // معالجة أخطاء 401 مع تحسين للمسارات العامة
    if (status === 401 && !originalRequest.__isRetryRequest) {
      // تحقق إذا كان المسار عامًا (لا يحتاج مصادقة)
      const isPublicRoute = /^\/(delivery\/(stores|categories|products\/search)|grocery\/|gas\/|water\/)/.test(originalRequest.url || '');

      if (isPublicRoute) {
        // للمسارات العامة: لا نحاول تحديث التوكن، فقط نظف وتابع كضيف
        storage.clearTokens?.();
        storage.clearUserData?.();
        // لا تعمل إعادة توجيه هنا - فقط رفض الخطأ برسالة ودية
        return Promise.reject(new Error('المحتوى متاح للزوار، يرجى المتابعة بدون تسجيل الدخول'));
      }

      // للمسارات المحمية: جرب تحديث التوكن مرة واحدة
      const refreshToken = storage.getRefreshToken?.();
      if (refreshToken && !isRefreshing) {
        try {
          isRefreshing = true;
          // نمنع تساقط الطلبات، ننتظر التحديث
          const newToken: string | undefined = await (async () => {
            // TODO: نفّذ نداء /auth/refresh لديك وأعد التوكن
            // const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            // storage.setTokens(data); return data.accessToken;
            return undefined; // ما عندك ريفرش؟ خليه undefined
          })();
          flushQueue(newToken);
          isRefreshing = false;

          if (newToken) {
            storage.setIdToken?.(newToken);
            originalRequest.__isRetryRequest = true;
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } else {
            // ما قدرنا نحدّث → سجّل خروج "صامت" واكمل كضيف
            storage.clearTokens?.();
            storage.clearUserData?.();
            // لا تعمل Redirect هنا
          }
        } catch {
          flushQueue();
          isRefreshing = false;
          storage.clearTokens?.();
          storage.clearUserData?.();
          // لا تعمل Redirect هنا
        }
      } else if (refreshToken && isRefreshing) {
        // لو فيه تحديث جارٍ، انتظر
        return new Promise((resolve) => {
          pendingQueue.push((newToken?: string) => {
            if (newToken) {
              originalRequest.__isRetryRequest = true;
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(originalRequest));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      } else {
        // ضيف أو توكن منتهي بلا ريفرش: نظّف فقط
        storage.clearTokens?.();
        storage.clearUserData?.();
        // لا Redirect هنا
      }
    }

    if (status === 403) {
      // سجل فقط… القرار واجهوي
      console.warn("Access forbidden:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
