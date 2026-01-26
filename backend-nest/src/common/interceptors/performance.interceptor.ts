import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { PerformanceService } from '../services/performance.service';
import { Response, Request } from 'express';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(private readonly performanceService: PerformanceService | null) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract request details
    const endpoint = this.getEndpoint(request);
    const method = request.method;
    const userId = (request as any).user?.id || (request as any).user?.userId;
    const userAgent = request.get('User-Agent');
    const ip = this.getClientIP(request);

    return next.handle().pipe(
      tap(async () => {
        const responseTime = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Record performance metric
        try {
          if (this.performanceService) {
            await this.performanceService.recordMetric({
              endpoint,
              method,
              responseTime,
              statusCode,
              userAgent,
              ip,
              userId,
            });

            // Check for budget violations
            const violation = await this.performanceService.checkBudgetViolation({
              endpoint,
              method,
              responseTime,
              statusCode,
              timestamp: new Date(),
            });

            if (violation.violated) {
              this.logger.warn(
                `Performance budget violation for ${method} ${endpoint}: ${violation.violations.join(', ')}`
              );
            }
          }

          // Log slow requests
          if (responseTime > 5000) { // 5 seconds
            this.logger.warn(
              `Slow request: ${method} ${endpoint} took ${responseTime}ms`,
              {
                userId,
                ip,
                userAgent: userAgent?.substring(0, 100),
              }
            );
          }

        } catch (error) {
          // Don't let performance tracking break the response
          this.logger.error('Performance tracking failed:', error);
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;

        // Record failed requests
        if (this.performanceService) {
          this.performanceService.recordMetric({
            endpoint,
            method,
            responseTime,
            statusCode: error.status || 500,
            userAgent,
            ip,
            userId,
          }).catch(err => this.logger.error('Failed to record error metric:', err));
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
