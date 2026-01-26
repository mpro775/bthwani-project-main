// ✅ تعريفات موحدة للـ API بناءً على الباك إند الجديد

/**
 * شكل الاستجابة الموحد من الباك إند
 * يأتي مع جميع الطلبات سواء نجحت أو فشلت
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationMeta;
}

/**
 * تفاصيل الخطأ - تأتي عند فشل الطلب
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  userMessage?: string; // رسالة بالعربي للمستخدم
  suggestedAction?: string; // اقتراح للحل
}

/**
 * معلومات إضافية عن الاستجابة
 */
export interface ApiMeta {
  timestamp: string;
  path: string;
  version: string;
}

/**
 * معلومات الصفحات (Pagination)
 */
export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string;
  hasMore?: boolean;
}

/**
 * خيارات للصفحات
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * أكواد الأخطاء الشائعة من الباك إند
 */
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  NOT_ACCEPTABLE = 'NOT_ACCEPTABLE',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  LOCKED = 'LOCKED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * رسائل الأخطاء بالعربي
 */
export const ERROR_MESSAGES: Record<ErrorCode, { title: string; message: string; action: string }> = {
  [ErrorCode.BAD_REQUEST]: {
    title: 'بيانات غير صحيحة',
    message: 'البيانات المدخلة غير صحيحة',
    action: 'يرجى التحقق من البيانات المدخلة',
  },
  [ErrorCode.UNAUTHORIZED]: {
    title: 'غير مصرح',
    message: 'يجب تسجيل الدخول أولاً',
    action: 'يرجى تسجيل الدخول مرة أخرى',
  },
  [ErrorCode.PAYMENT_REQUIRED]: {
    title: 'يتطلب الدفع',
    message: 'يتطلب الدفع لإتمام العملية',
    action: 'يرجى إتمام عملية الدفع للمتابعة',
  },
  [ErrorCode.FORBIDDEN]: {
    title: 'محظور',
    message: 'ليس لديك صلاحية للوصول',
    action: 'يرجى التواصل مع الإدارة للحصول على الصلاحيات',
  },
  [ErrorCode.NOT_FOUND]: {
    title: 'غير موجود',
    message: 'البيانات المطلوبة غير موجودة',
    action: 'يرجى التحقق من المعلومات والمحاولة مرة أخرى',
  },
  [ErrorCode.METHOD_NOT_ALLOWED]: {
    title: 'طريقة غير مسموحة',
    message: 'طريقة الطلب غير مدعومة',
    action: 'يرجى المحاولة مرة أخرى',
  },
  [ErrorCode.NOT_ACCEPTABLE]: {
    title: 'غير مقبول',
    message: 'الطلب غير مقبول',
    action: 'يرجى المحاولة بطريقة أخرى',
  },
  [ErrorCode.REQUEST_TIMEOUT]: {
    title: 'انتهت المهلة',
    message: 'انتهت مهلة الطلب',
    action: 'يرجى المحاولة مرة أخرى',
  },
  [ErrorCode.CONFLICT]: {
    title: 'تعارض',
    message: 'يوجد تعارض في البيانات',
    action: 'يرجى المحاولة مرة أخرى',
  },
  [ErrorCode.GONE]: {
    title: 'غير متاح',
    message: 'المحتوى لم يعد متاحاً',
    action: 'هذا المحتوى لم يعد متاحاً',
  },
  [ErrorCode.PAYLOAD_TOO_LARGE]: {
    title: 'حجم كبير',
    message: 'الملف أو البيانات كبيرة جداً',
    action: 'يرجى تقليل حجم الملف',
  },
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: {
    title: 'نوع غير مدعوم',
    message: 'نوع الملف غير مدعوم',
    action: 'يرجى استخدام نوع ملف مختلف',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    title: 'خطأ في التحقق',
    message: 'البيانات المدخلة لا تطابق المتطلبات',
    action: 'يرجى التحقق من البيانات المدخلة',
  },
  [ErrorCode.LOCKED]: {
    title: 'مقفل',
    message: 'المورد مقفل حالياً',
    action: 'يرجى الانتظار، هذا المورد مقفل مؤقتاً',
  },
  [ErrorCode.TOO_MANY_REQUESTS]: {
    title: 'طلبات كثيرة',
    message: 'عدد الطلبات كبير جداً',
    action: 'يرجى الانتظار قليلاً والمحاولة مرة أخرى',
  },
  [ErrorCode.INTERNAL_ERROR]: {
    title: 'خطأ داخلي',
    message: 'حدث خطأ في الخادم',
    action: 'يرجى المحاولة لاحقاً أو التواصل مع الدعم',
  },
  [ErrorCode.NOT_IMPLEMENTED]: {
    title: 'غير منفذ',
    message: 'هذه الميزة غير متاحة حالياً',
    action: 'هذه الميزة قيد التطوير',
  },
  [ErrorCode.BAD_GATEWAY]: {
    title: 'بوابة سيئة',
    message: 'خطأ في الاتصال بالخادم',
    action: 'يرجى المحاولة لاحقاً',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    title: 'خدمة غير متاحة',
    message: 'الخدمة غير متاحة حالياً',
    action: 'يرجى المحاولة لاحقاً',
  },
  [ErrorCode.GATEWAY_TIMEOUT]: {
    title: 'انتهت مهلة البوابة',
    message: 'انتهت مهلة الاتصال بالخادم',
    action: 'يرجى المحاولة مرة أخرى',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    title: 'خطأ غير معروف',
    message: 'حدث خطأ غير متوقع',
    action: 'يرجى المحاولة مرة أخرى',
  },
};

/**
 * استخراج البيانات من الاستجابة
 */
export function extractData<T>(response: ApiResponse<T>): T | undefined {
  return response.data;
}

/**
 * استخراج رسالة الخطأ من الاستجابة
 */
export function extractErrorMessage(error: any): string {
  // محاولة استخراج رسالة الخطأ من البنية الجديدة
  if (error?.response?.data?.error?.userMessage) {
    return error.response.data.error.userMessage;
  }
  
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // محاولة استخراج من error code
  const code = error?.response?.data?.error?.code as ErrorCode;
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code].message;
  }

  // رسالة افتراضية
  return error?.message || 'حدث خطأ غير متوقع';
}

/**
 * استخراج الإجراء المقترح من الخطأ
 */
export function extractSuggestedAction(error: any): string | undefined {
  // محاولة استخراج من البنية الجديدة
  if (error?.response?.data?.error?.suggestedAction) {
    return error.response.data.error.suggestedAction;
  }

  // محاولة استخراج من error code
  const code = error?.response?.data?.error?.code as ErrorCode;
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code].action;
  }

  return undefined;
}

/**
 * التحقق من نجاح الطلب
 */
export function isSuccess<T>(response: ApiResponse<T>): boolean {
  return response.success === true;
}

/**
 * التحقق من فشل الطلب
 */
export function isError<T>(response: ApiResponse<T>): boolean {
  return response.success === false;
}


