import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { RuntimeTapService } from '../services/runtime-tap.service';
import { Response, Request } from 'express';

@Injectable()
export class RuntimeTapInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RuntimeTapInterceptor.name);

  constructor(private readonly runtimeTapService: RuntimeTapService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract request details
    const endpoint = this.getEndpoint(request);
    const method = request.method;
    const userId = (request as any).user?.id || (request as any).user?.userId;
    const userAgent = request.get('User-Agent');
    const ip = this.getClientIP(request);

    return next.handle().pipe(
      tap(() => {
        // Record successful request
        try {
          this.runtimeTapService.recordCall({
            method,
            path: endpoint,
            timestamp: new Date(),
            statusCode: response.statusCode,
            userAgent,
            ip,
            userId,
          });
        } catch (error) {
          this.logger.error('Runtime tap recording failed:', error);
        }
      }),
      catchError((error) => {
        // Record failed request
        try {
          this.runtimeTapService.recordCall({
            method,
            path: endpoint,
            timestamp: new Date(),
            statusCode: error.status || 500,
            userAgent,
            ip,
            userId,
          });
        } catch (tapError) {
          this.logger.error('Runtime tap recording failed for error:', tapError);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Extract clean endpoint path
   */
  private getEndpoint(request: Request): string {
    let endpoint = request.route?.path || request.path;

    // Remove parameter placeholders
    endpoint = endpoint.replace(/:[^/]+/g, ':param');

    // Remove query parameters
    const queryIndex = endpoint.indexOf('?');
    if (queryIndex > -1) {
      endpoint = endpoint.substring(0, queryIndex);
    }

    // Normalize multiple slashes
    endpoint = endpoint.replace(/\/+/g, '/');

    return endpoint;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: Request): string {
    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      (request.connection as any)?.socket?.remoteAddress ||
      'unknown'
    );
  }
}
