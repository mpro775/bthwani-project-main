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
 * استخراج رسالة الخطأ من الاستجابة
 */
export function extractErrorMessage(error: any): string {
  if (error?.response?.data?.error?.userMessage) {
    return error.response.data.error.userMessage;
  }
  
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  return error?.message || 'حدث خطأ غير متوقع';
}

/**
 * استخراج الإجراء المقترح من الخطأ
 */
export function extractSuggestedAction(error: any): string | undefined {
  if (error?.response?.data?.error?.suggestedAction) {
    return error.response.data.error.suggestedAction;
  }

  return undefined;
}


