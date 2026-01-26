import Constants from "expo-constants";

// روابط API
const LOCAL_API = "http://192.168.0.116:3000/api/v1";
const PRODUCTION_API = "https://bthwani-backend-9u4r.onrender.com/api/v1";

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

// ✅ استخدم الاختيار الفعلي
export const API_URL = PRODUCTION_API;
