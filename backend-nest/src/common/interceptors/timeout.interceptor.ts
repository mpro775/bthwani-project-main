import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { logger } from '../../config/logger.config';
import { Request } from 'express';
import { Error } from 'mongoose';

/**
 * Timeout Interceptor - معالجة موحدة للطلبات البطيئة
 * يسجل حالات timeout ويرجع استجابة موحدة
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs: number;

  constructor(timeoutMs = 30000) {
    this.timeoutMs = timeoutMs;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const duration = Date.now() - startTime;

          // تسجيل Timeout
          logger.warn(
            `Request timeout after ${duration}ms: ${request.method} ${request.url}`,
            'TimeoutInterceptor',
          );

          // إرجاع استثناء 408
          return throwError(
            () =>
              new RequestTimeoutException({
                statusCode: 408,
                message: 'Request Timeout',
                userMessage: 'انتهى وقت الطلب، يرجى المحاولة مرة أخرى',
                error: 'Request took too long to process',
                timeout: this.timeoutMs,
                duration,
                path: request.url,
              }),
          );
        }
        return throwError(() => err as Error);
      }),
    );
  }
}
