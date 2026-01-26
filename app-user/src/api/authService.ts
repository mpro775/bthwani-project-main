// src/api/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { AuthApi } from "./generated/AuthApi";

/**
 * ✅ تم التحديث: الآن نستخدم API الخاص بنا بدلاً من Firebase المباشر
 * هذا الملف مسؤول عن إدارة توكنات Firebase وإرسالها للسيرفر للحصول على JWT
 */

const API_KEY = "AIzaSyDcj9GF6Jsi7aIWHoOmH9OKwdOs2pRswS0";
const BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

// إنشاء instance من AuthApi
const authApi = new AuthApi();

// مفاتيح التخزين المحلي
const ID_KEY = "firebase-idToken";
const REFRESH_KEY = "firebase-refreshToken";
const EXPIRY_KEY = "firebase-expiryTime";

// هامش تجديد مسبق للتوكن قبل انتهائه (بالمللي ثانية)
const PREEMPT_REFRESH_MS = 5000;

/** تنظيف أي اقتباسات/مسافات حول JWT */
const cleanToken = (t: string | null | undefined) =>
  t
    ? t
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1")
        .trim()
    : t;

async function debugPrintClientToken(prefix = "") {
  const raw = await AsyncStorage.getItem(ID_KEY);
  const token = cleanToken(raw);
  if (!token) {
    return;
  }
}

/* =========================
 * عمليات التسجيل/الدخول الأساسية
 * ========================= */

export const registerWithEmail = async (email: string, password: string) => {
  const endpoint = `${BASE_URL}/accounts:signUp?key=${API_KEY}`;
  const payload = { email, password, returnSecureToken: true };
  const response = await axios.post(endpoint, payload);
  return response.data;
};

export const loginWithEmail = async (email: string, password: string) => {
  // 1. الحصول على Firebase token
  const { data: firebaseData } = await axios.post(
    `${BASE_URL}/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );

  const expiresInMs = parseInt(firebaseData.expiresIn, 10) * 1000;
  const expiryTime = Date.now() + expiresInMs;

  // 2. حفظ Firebase tokens محلياً
  await AsyncStorage.multiSet([
    [ID_KEY, firebaseData.idToken],
    [REFRESH_KEY, firebaseData.refreshToken],
    [EXPIRY_KEY, String(expiryTime)],
  ]);

  // 3. إرسال idToken إلى API الخاص بنا للحصول على JWT
  try {
    const serverResponse = await authApi.auth_controller_login_with_firebase({
      firebaseToken: firebaseData.idToken,
      userType: "user"
    });

    // 4. حفظ JWT token من السيرفر
    await AsyncStorage.setItem("jwt-token", serverResponse.data.token);
    await AsyncStorage.setItem("user-data", JSON.stringify(serverResponse.data.user));

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

    await debugPrintClientToken("afterLogin");
    return {
      ...firebaseData,
      jwtToken: serverResponse.data.token,
      user: serverResponse.data.user
    };

  } catch (serverError) {
    console.warn("Server auth failed, using Firebase only:", serverError);
    // في حال فشل السيرفر، نستمر مع Firebase فقط
    return firebaseData;
  }
};

/* =========================
 * إدارة/تجديد التوكنات
 * ========================= */

/** يعيد idToken المخزّن إن وجد (نظيف) */
async function getStoredIdToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(ID_KEY);
  const token = cleanToken(raw);
  return token || null;
}

/**
 * يجرب إرجاع idToken الحالي، أو يجري تجديدًا إذا انتهى.
 * لا يرمي إذا لم يوجد refresh token — يرجع null بدلاً من ذلك.
 */
export async function refreshIdToken(): Promise<string | null> {
  try {
    const entries = await AsyncStorage.multiGet([
      REFRESH_KEY,
      EXPIRY_KEY,
      ID_KEY,
    ]);
    const refreshToken = cleanToken(
      entries.find(([k]) => k === REFRESH_KEY)?.[1]
    );
    const expiryTimeStr = entries.find(([k]) => k === EXPIRY_KEY)?.[1] || "";
    const storedIdToken =
      cleanToken(entries.find(([k]) => k === ID_KEY)?.[1]) || null;

    if (!refreshToken) {
      // لا refresh token => المستخدم ليس مسجلاً أو جلسة مفقودة
      return null;
    }

    const now = Date.now();
    const expiry = parseInt(expiryTimeStr, 10);

    // لو التوكن الحالي ما زال صالحًا (مع هامش أمان)، أرجعه
    if (
      storedIdToken &&
      Number.isFinite(expiry) &&
      now < expiry - PREEMPT_REFRESH_MS
    ) {
      return storedIdToken;
    }

    // خلاف ذلك، جدّد
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const { data } = await axios.post(
      `${SECURE_TOKEN_URL}?key=${API_KEY}`,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const newIdToken: string = data.id_token;
    const newRefreshToken: string = data.refresh_token;
    const newExpiry = Date.now() + parseInt(data.expires_in, 10) * 1000;

    await AsyncStorage.multiSet([
      [ID_KEY, newIdToken],
      [REFRESH_KEY, newRefreshToken],
      [EXPIRY_KEY, String(newExpiry)],
    ]);

    return newIdToken;
  } catch (err) {
    console.warn("refreshIdToken error:", err);
    return null;
  }
}

/** يبني هيدر Authorization من JWT token */
export async function getAuthHeader(): Promise<Record<string, string>> {
  const jwtToken = await AsyncStorage.getItem("jwt-token");
  return jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
}

/** يحدّث هيدر Authorization على أي AxiosInstance يُمرّر */
async function setAxiosAuthHeader(
  instance: AxiosInstance
): Promise<string | null> {
  const jwtToken = await AsyncStorage.getItem("jwt-token");
  if (jwtToken) {
    instance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
  return jwtToken;
}

/** دالة fetch مع إضافة JWT Authorization تلقائيًا */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const jwtToken = await AsyncStorage.getItem("jwt-token");
  const headers = {
    ...(options.headers || {}),
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  } as Record<string, string>;
  return fetch(url, { ...options, headers });
}

/** تخزين صريح لتوكنات Firebase (مفيد عند تدفّق OAuth خارجي مثلاً) */
export const storeFirebaseTokens = async (
  idToken: string,
  refreshToken: string,
  expiresIn: number
) => {
  const expiryTime = Date.now() + expiresIn * 1000;
  await AsyncStorage.multiSet([
    [ID_KEY, idToken],
    [REFRESH_KEY, refreshToken],
    [EXPIRY_KEY, String(expiryTime)],
  ]);
};

/** مسح جميع التوكنات (Firebase + JWT) المخزّنة (مفيد في logout) */
const clearAllTokens = async () => {
  await AsyncStorage.multiRemove([
    ID_KEY,
    REFRESH_KEY,
    EXPIRY_KEY,
    "jwt-token",
    "user-data"
  ]);
};

export default {
  loginWithEmail,
  registerWithEmail,
  refreshIdToken,
  getStoredIdToken,
  fetchWithAuth,
  storeFirebaseTokens,
  clearAllTokens,
  getAuthHeader,
  setAxiosAuthHeader,
};
