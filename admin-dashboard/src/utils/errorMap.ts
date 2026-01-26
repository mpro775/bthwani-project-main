// src/utils/errorMap.ts
export const ERROR_MAP: Record<string, {title: string; message: string; action?: () => void}> = {
  INVALID_TOKEN_FORMAT: { title: "تعذّر التحقق", message: "انتهت جلستك أو غير صالحة. سجّل الدخول مجددًا." },
  UNAUTHORIZED:         { title: "غير مصرّح",   message: "يرجى تسجيل الدخول." },
  ADMIN_REQUIRED:       { title: "وصول مقيّد",  message: "هذا الإجراء يتطلب صلاحيات مدير." },
  VALIDATION_FAILED:    { title: "بيانات ناقصة", message: "راجع الحقول وأعد المحاولة." },
  RATE_LIMITED:         { title: "طلبات كثيرة",  message: "انتظر قليلًا ثم أعد المحاولة." },
  INTERNAL_ERROR:       { title: "خطأ غير متوقع", message: "حدث خلل، جرّب لاحقًا." },
};
