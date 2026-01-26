export class ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    userMessage?: string; // رسالة بالعربي للمستخدم
    suggestedAction?: string; // اقتراح للحل
  };
  meta?: {
    timestamp: string;
    path: string;
    version: string;
  };
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    nextCursor?: string;
    hasMore?: boolean;
  };
}
