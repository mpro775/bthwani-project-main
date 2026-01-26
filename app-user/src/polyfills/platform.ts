// src/polyfills/platform.ts
import { Platform as RNPlatform } from "react-native";

// وفّر Platform على الـ global للمكتبات القديمة التي تتوقعه هناك
// لا تستبدل لو كان موجود مسبقًا
if (!(globalThis as any).Platform) {
  (globalThis as any).Platform = RNPlatform;
}
