import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/response.dto';

interface ExceptionWithDetails {
  code?: string;
  message?: string;
  response?: { message?: string };
  userMessage?: string;
  suggestedAction?: string;
  stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exc = exception as ExceptionWithDetails;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: exc?.code || this.getErrorCode(status),
        message: exc?.message || 'Internal server error',
        details: exc?.response?.message || exc?.message,
        userMessage: this.getUserMessage(exc, status),
        suggestedAction: this.getSuggestedAction(exc, status),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        version: 'v2.0',
      },
    };

    // Log critical errors
    if (status >= 500) {
      this.logger.error('Critical Error:', {
        error: exc as Error,
        stack: exc?.stack || undefined,
        path: request.url,
        method: request.method,
        user: request.user?.id || undefined,
      });
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      402: 'PAYMENT_REQUIRED',        // ✅ جديد
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',      // ✅ جديد
      406: 'NOT_ACCEPTABLE',          // ✅ جديد
      408: 'REQUEST_TIMEOUT',         // ✅ جديد
      409: 'CONFLICT',
      410: 'GONE',                    // ✅ جديد
      413: 'PAYLOAD_TOO_LARGE',       // ✅ جديد
      415: 'UNSUPPORTED_MEDIA_TYPE',  // ✅ جديد
      422: 'VALIDATION_ERROR',
      423: 'LOCKED',                  // ✅ جديد
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      501: 'NOT_IMPLEMENTED',         // ✅ جديد
      502: 'BAD_GATEWAY',             // ✅ جديد
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',         // ✅ جديد
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  private getUserMessage(
    exception: ExceptionWithDetails,
    status: number,
  ): string {
    const arabicMessages: Record<number, string> = {
      400: 'البيانات المدخلة غير صحيحة',
      401: 'يجب تسجيل الدخول أولاً',
      402: 'يتطلب الدفع لإتمام العملية',                    // ✅ جديد
      403: 'ليس لديك صلاحية للوصول',
      404: 'البيانات المطلوبة غير موجودة',
      405: 'الطريقة المستخدمة غير مسموحة',                  // ✅ جديد
      406: 'الصيغة المطلوبة غير مدعومة',                    // ✅ جديد
      408: 'انتهت مهلة الطلب',                              // ✅ جديد
      409: 'البيانات موجودة مسبقاً',
      410: 'البيانات تم حذفها نهائياً',                     // ✅ جديد
      413: 'حجم البيانات كبير جداً',                       // ✅ جديد
      415: 'نوع الملف غير مدعوم',                          // ✅ جديد
      422: 'البيانات غير صالحة',
      423: 'البيانات مقفلة حالياً',                         // ✅ جديد
      429: 'تجاوزت الحد المسموح من الطلبات',
      500: 'حدث خطأ في النظام',
      501: 'الميزة غير متوفرة حالياً',                      // ✅ جديد
      502: 'خطأ في الاتصال مع الخدمة',                      // ✅ جديد
      503: 'الخدمة غير متاحة حالياً',
      504: 'انتهت مهلة الاتصال',                            // ✅ جديد
    };
    return (
      (exception?.userMessage as string) ||
      arabicMessages[status] ||
      'حدث خطأ غير متوقع'
    );
  }

  private getSuggestedAction(
    exception: ExceptionWithDetails,
    status: number,
  ): string {
    const actions: Record<number, string> = {
      400: 'يرجى التحقق من البيانات المدخلة',
      401: 'يرجى تسجيل الدخول مرة أخرى',
      402: 'يرجى إتمام عملية الدفع للمتابعة',                              // ✅ جديد
      403: 'يرجى التواصل مع الإدارة للحصول على الصلاحيات',
      404: 'يرجى التحقق من المعلومات والمحاولة مرة أخرى',
      405: 'يرجى استخدام طريقة الطلب الصحيحة (GET, POST, PUT, DELETE)',  // ✅ جديد
      406: 'يرجى تحديد صيغة مقبولة في رأس الطلب',                        // ✅ جديد
      408: 'يرجى المحاولة مرة أخرى، قد يكون الاتصال بطيئاً',              // ✅ جديد
      409: 'يرجى استخدام بيانات مختلفة',
      410: 'هذا المحتوى لم يعد متاحاً',                                  // ✅ جديد
      413: 'يرجى تقليل حجم البيانات أو الملف المرسل',                   // ✅ جديد
      415: 'يرجى استخدام نوع ملف مدعوم (مثل: image/jpeg, application/json)', // ✅ جديد
      422: 'يرجى مراجعة جميع الحقول المطلوبة',
      423: 'يرجى الانتظار، هذا المورد مقفل مؤقتاً',                       // ✅ جديد
      429: 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى',
      500: 'يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني',
      501: 'هذه الميزة قيد التطوير، يرجى المحاولة لاحقاً',                 // ✅ جديد
      502: 'يرجى المحاولة لاحقاً، الخادم يواجه مشكلة مؤقتة',               // ✅ جديد
      503: 'الخدمة قيد الصيانة، يرجى المحاولة بعد قليل',
      504: 'يرجى المحاولة مرة أخرى، استغرق الطلب وقتاً طويلاً',           // ✅ جديد
    };
    return (
      (exception?.suggestedAction as string) ||
      actions[status] ||
      'يرجى المحاولة مرة أخرى'
    );
  }
}
