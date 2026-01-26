import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    // Increment request counter
    this.metricsService.incrementCounter('http_requests_total', 1, {
      method,
      route,
      controller,
      handler,
    });

    // Track active requests
    this.metricsService.incrementGauge('http_requests_active', 1);

    return next.handle().pipe(
      tap(() => {
        // Decrement active requests
        this.metricsService.decrementGauge('http_requests_active', 1);

        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        const statusCode = response.statusCode;

        // Record request duration
        this.metricsService.observeHistogram(
          'http_request_duration_seconds',
          duration,
          [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
        );

        // Record request duration as summary
        this.metricsService.recordSummary('http_request_duration_ms', duration * 1000, {
          method,
          route,
          status: statusCode.toString(),
        });

        // Increment response counter by status code
        this.metricsService.incrementCounter('http_responses_total', 1, {
          method,
          route,
          status: statusCode.toString(),
          statusClass: `${Math.floor(statusCode / 100)}xx`,
        });

        // Track success rate
        if (statusCode >= 200 && statusCode < 300) {
          this.metricsService.incrementCounter('http_requests_successful', 1, {
            method,
            route,
          });
        } else if (statusCode >= 400) {
          this.metricsService.incrementCounter('http_requests_failed', 1, {
            method,
            route,
            status: statusCode.toString(),
          });
        }
      }),
      catchError((error) => {
        // Decrement active requests on error
        this.metricsService.decrementGauge('http_requests_active', 1);

        const duration = (Date.now() - startTime) / 1000;
        const statusCode = error.status || 500;

        // Record error metrics
        this.metricsService.observeHistogram('http_request_duration_seconds', duration);

        this.metricsService.incrementCounter('http_requests_failed', 1, {
          method,
          route,
          status: statusCode.toString(),
          error: error.name,
        });

        this.metricsService.incrementCounter('http_errors_total', 1, {
          method,
          route,
          status: statusCode.toString(),
          errorType: error.name,
        });

        throw error;
      }),
    );
  }
}

