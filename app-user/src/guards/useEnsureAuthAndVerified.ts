// src/hooks/useEnsureAuthAndVerified.ts
import { useAuth } from "@/auth/AuthContext";
import { useVerificationState } from "@/context/verify";
import { getAuthBanner } from "@/guards/bannerGateway";
import { safeNavigate } from "@/navigation/RootNavigation";
import { useCallback } from "react";

export function useEnsureAuthAndVerified(opts?: {
  requireVerified?: boolean;
  cooldownMs?: number;
}) {
  const requireVerified = opts?.requireVerified ?? true;
  const cooldownMs = opts?.cooldownMs ?? 1200;

  const { isLoggedIn, authReady, lastAuthChangeTs } = useAuth();
  const { verified, loading: verifyLoading } = useVerificationState();

  return useCallback(async () => {
    // انتظر جاهزية حالة الدخول والتحقق
    if (!authReady || (requireVerified && verifyLoading)) return true;

    // تبريد لمنع تكرار الإشعار مباشرة بعد تغيّر الحالة
    if (Date.now() - lastAuthChangeTs < cooldownMs) return true;

    // 1) المستخدم غير مسجل دخول
    if (!isLoggedIn) {
      const banner = getAuthBanner();
      if (banner) {
        banner.show("login");
      } else {
        // احتياطي نادر لو لم يُركّب الـAuthBanner
        safeNavigate("Login");
      }
      return false;
    }

    // 2) يتطلب التحقق والمستخدم غير موثّق
    if (requireVerified && !verified) {
      const banner = getAuthBanner();
      if (banner) {
        banner.show("verify");
      } else {
        safeNavigate("OTPVerification");
      }
      return false;
    }

    // 3) كل شيء تمام
    return true;
  }, [
    authReady,
    verifyLoading,
    isLoggedIn,
    verified,
    requireVerified,
    lastAuthChangeTs,
    cooldownMs,
  ]);
}
