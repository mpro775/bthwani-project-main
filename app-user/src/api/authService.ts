// src/api/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/utils/api/config";

// مفاتيح التخزين المحلي
const JWT_TOKEN_KEY = "jwt-token";
const USER_DATA_KEY = "user-data";

/** تنظيف أي اقتباسات/مسافات حول JWT */
const cleanToken = (t: string | null | undefined) =>
  t
    ? t
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1")
        .trim()
    : t;

/* =========================
 * عمليات التسجيل/الدخول
 * ========================= */

/**
 * تسجيل حساب جديد
 */
export const registerLocal = async (
  email: string,
  password: string,
  fullName: string,
  phone: string
) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
      },
      {
        timeout: 15000,
      }
    );

    const { token, user } = response.data.data;

    // حفظ JWT token
    if (token?.accessToken) {
      await AsyncStorage.setItem(JWT_TOKEN_KEY, token.accessToken);
    }

    // حفظ بيانات المستخدم
    if (user) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }

    return {
      success: true,
      token: token?.accessToken,
      user,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error?.userMessage ||
      error?.response?.data?.message ||
      error?.message ||
      "حدث خطأ أثناء التسجيل";

    throw new Error(errorMessage);
  }
};

/**
 * تسجيل الدخول
 */
export const loginLocal = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: email.trim(),
        password,
      },
      {
        timeout: 15000,
      }
    );

    const { token, user } = response.data.data;

    // حفظ JWT token
    if (token?.accessToken) {
      await AsyncStorage.setItem(JWT_TOKEN_KEY, token.accessToken);
    }

    // حفظ بيانات المستخدم
    if (user) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }

    // استدعاءات خارجية قد تسبب require-cycle -> استوردها ديناميكيًا
    try {
      const { track } = await import("../utils/lib/track");
      await track({ type: "login" });
    } catch (e) {
      console.warn("track failed", e);
    }
    try {
      const { registerPushToken } = await import("../notify");
      await registerPushToken("user");
    } catch (e) {
      console.warn("push reg failed", e);
    }

    return {
      success: true,
      token: token?.accessToken,
      user,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error?.userMessage ||
      error?.response?.data?.message ||
      error?.message ||
      "البريد الإلكتروني أو كلمة المرور غير صحيحة";

    throw new Error(errorMessage);
  }
};

/**
 * إرسال OTP عبر البريد الإلكتروني
 */
export const sendOtp = async () => {
  try {
    const token = await getStoredJwtToken();
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const response = await axios.post(
      `${API_URL}/users/otp/send`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      }
    );

    return {
      success: true,
      message: response.data.message || "تم إرسال رمز التحقق بنجاح",
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error?.userMessage ||
      error?.response?.data?.message ||
      error?.message ||
      "فشل إرسال رمز التحقق";

    throw new Error(errorMessage);
  }
};

/**
 * التحقق من OTP عبر البريد الإلكتروني
 */
export const verifyEmailOtp = async (code: string) => {
  try {
    const token = await getStoredJwtToken();
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const response = await axios.post(
      `${API_URL}/auth/verify-email-otp`,
      { code },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      }
    );

    const { token: newToken, user } = response.data.data;

    // تحديث JWT token إذا تم إرجاع واحد جديد
    if (newToken?.accessToken) {
      await AsyncStorage.setItem(JWT_TOKEN_KEY, newToken.accessToken);
    }

    // تحديث بيانات المستخدم
    if (user) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }

    return {
      success: true,
      verified: true,
      token: newToken?.accessToken,
      user,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error?.userMessage ||
      error?.response?.data?.message ||
      error?.message ||
      "رمز التحقق غير صحيح";

    throw new Error(errorMessage);
  }
};

/* =========================
 * إدارة التوكنات
 * ========================= */

/**
 * يعيد JWT token المخزّن إن وجد (نظيف)
 */
export async function getStoredJwtToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(JWT_TOKEN_KEY);
  const token = cleanToken(raw);
  return token || null;
}

/**
 * يبني هيدر Authorization من JWT token
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  const jwtToken = await getStoredJwtToken();
  return jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
}

/**
 * يحدّث هيدر Authorization على أي AxiosInstance يُمرّر
 */
async function setAxiosAuthHeader(instance: any): Promise<string | null> {
  const jwtToken = await getStoredJwtToken();
  if (jwtToken) {
    instance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
  return jwtToken;
}

/**
 * دالة fetch مع إضافة JWT Authorization تلقائيًا
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const jwtToken = await getStoredJwtToken();
  const headers = {
    ...(options.headers || {}),
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  } as Record<string, string>;
  return fetch(url, { ...options, headers });
}

/**
 * تخزين JWT token
 */
export const storeJwtToken = async (token: string) => {
  await AsyncStorage.setItem(JWT_TOKEN_KEY, token);
};

/**
 * مسح جميع التوكنات المخزّنة (مفيد في logout)
 */
export const clearAllTokens = async () => {
  await AsyncStorage.multiRemove([JWT_TOKEN_KEY, USER_DATA_KEY]);
};

/**
 * تجديد التوكن (للتوافق مع الكود القديم)
 * في النظام الجديد، JWT tokens لا تحتاج تجديد تلقائي
 * لكن يمكن إعادة استخدام نفس التوكن إذا كان صالحاً
 */
export async function refreshIdToken(): Promise<string | null> {
  // في النظام الجديد، نعيد نفس التوكن إذا كان موجوداً
  // السيرفر سيرفضه إذا انتهت صلاحيته
  return getStoredJwtToken();
}

export default {
  registerLocal,
  loginLocal,
  sendOtp,
  verifyEmailOtp,
  refreshIdToken,
  getStoredJwtToken,
  fetchWithAuth,
  storeJwtToken,
  clearAllTokens,
  getAuthHeader,
  setAxiosAuthHeader,
};
