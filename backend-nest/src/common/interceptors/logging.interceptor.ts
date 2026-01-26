import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AppLoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = request.startTime || Date.now();

    // Log request
    this.logger.debug(`Incoming Request: ${request.method} ${request.url}`, {
      correlationId: request.correlationId,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers?.['user-agent'],
      userId: request.user?.userId || request.user?.id,
    });

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        const duration = Date.now() - startTime;
        this.logger.logRequest(request, response.statusCode, duration);
      }),
      catchError((error) => {
        // Log error response
        const duration = Date.now() - startTime;
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;

        this.logger.error(
          `Request failed: ${request.method} ${request.url}`,
          error.stack,
          {
            correlationId: request.correlationId,
            method: request.method,
            url: request.url,
            statusCode,
            duration,
            errorMessage: error.message,
            errorName: error.name,
            userId: request.user?.userId || request.user?.id,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}

