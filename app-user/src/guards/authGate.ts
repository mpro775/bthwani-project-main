// src/state/authGate.ts

// كتم تنبيهات التوثيق/تسجيل الدخول لفترة زمنية محددة.
// مفيد أثناء الـ Onboarding أو أثناء عمليات الإقلاع.
let silenceUntil = 0;

/** اكتم تنبيهات 401/403 لمدة ms ميلي ثانية */
export function silenceAuthPrompts(ms: number) {
  silenceUntil = Date.now() + ms;
}

/** هل يجب كتم التنبيهات الآن؟ */
export function shouldSilenceAuthPrompts() {
  return Date.now() < silenceUntil;
}
