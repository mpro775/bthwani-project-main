// hooks/useProtectedAction.ts
import { useAuthBanner } from "@/components/AuthBanner";
import { IntentManager } from "@/context/intent";
import { useEnsureAuthAndVerified } from "@/guards/useEnsureAuthAndVerified";
import { useCallback } from "react";

type Opts = { requireVerified?: boolean; mode?: "soft" | "hard" };
/**
 * soft: يعرض بانر خفيف عند الرفض (لا مودال)
 * hard: يفتح مودال الـ Prompt (سلوكك الحالي)
 */
export function useProtectedAction(opts?: Opts) {
  const ensure = useEnsureAuthAndVerified({
    requireVerified: opts?.requireVerified ?? true,
    cooldownMs: 800,
  });
  const { show } = useAuthBanner();

  return useCallback(
    <T extends any[]>(fn: (...args: T) => any) =>
      async (...args: T) => {
        const ok = await ensure();
        if (ok) return fn(...args);

        // فشل الشرط: إمّا نعرض بانر (soft) أو نترك الـ Prompt (hard)
        if ((opts?.mode ?? "soft") === "soft") {
          // قرّر أي بانر تلزم (تسجيل/توثيق)
          // هنا سنعتمد على ensure الحالي: لا يعطينا السبب،
          // فحلّ عملي: أعِد استدعاء ensure على خطوتين خفيفتين.
          // أبسط: خزّنه كـ Intent ثم أعرض بانر تسجيل الدخول أولًا.
          IntentManager.set(() => fn(...args));
          show("login"); // لو تحتاج تفريق، عدّل useEnsureAuthAndVerified ليعيد الحالة
        }
        // "hard" سيُظهر المودال الموجود لديك أصلاً عبر hook ensure
        return;
      },
    [ensure, show, opts?.mode]
  );
}
