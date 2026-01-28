import Constants from "expo-constants";

// روابط API
// غيّر العنوان إذا كان الـ backend على جهاز آخر (مثلاً نفس جهاز Expo: استخدم IP الـ hostUri مثل 192.168.1.108)
const LOCAL_API = "http://192.168.0.116:3000/api/v1";
const PRODUCTION_API = "https://api-bthwani.smartagency-ye.com/api/v1";

// قراءة hostUri
const hostUri =
  Constants.expoConfig?.hostUri ||
  Constants.manifest2?.extra?.expoClient?.hostUri ||
  "";

const isLocal =
  __DEV__ &&
  (hostUri.startsWith("192.168.") ||
    hostUri.includes("localhost") ||
    hostUri.includes("127.0.0.1"));

/**
 * في التطوير (Expo من الشبكة المحلية): استخدم الـ API المحلي.
 * غيّر LOCAL_API إلى IP جهازك الذي يشغّل الـ backend إن لزم.
 * في الإنتاج: استخدم الـ API البعيد.
 */
export const API_URL = isLocal ? LOCAL_API : PRODUCTION_API;
