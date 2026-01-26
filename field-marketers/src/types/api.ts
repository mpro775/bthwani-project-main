// ✅ تعريفات موحدة للـ API بناءً على الباك إند الجديد

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  userMessage?: string;
  suggestedAction?: string;
}

export interface ApiMeta {
  timestamp: string;
  path: string;
  version: string;
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string;
  hasMore?: boolean;
}

export function extractErrorMessage(error: any): string {
  if (error?.response?.data?.error?.userMessage) {
    return error.response.data.error.userMessage;
  }
  
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  return error?.message || 'حدث خطأ غير متوقع';
}

export function extractSuggestedAction(error: any): string | undefined {
  return error?.response?.data?.error?.suggestedAction;
}


