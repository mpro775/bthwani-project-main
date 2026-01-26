/**
 * BTW-OBS-004: OpenTelemetry Tracing Middleware
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { trace, SpanStatusCode, Span } from '@opentelemetry/api';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private readonly tracer = trace.getTracer('bthwani-http-middleware');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    let span: Span | undefined;

    // Create span for telemetry-enabled environments
    if (process.env.ENABLE_TELEMETRY === 'true') {
      let route = req.path;
      if (
        typeof req.route === 'object' &&
        req.route !== null &&
        'path' in req.route
      ) {
        route = String((req.route as { path: string }).path);
      }

      span = this.tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
        attributes: {
          'http.method': req.method,
          'http.url': req.url,
          'http.target': req.path,
          'http.host': req.hostname,
          'http.scheme': req.protocol,
          'http.user_agent': req.get('user-agent') || 'unknown',
          'http.client_ip': req.ip,
          'http.route': route,
        },
      });
    }

    // Record request
    res.on('finish', () => {
      const duration = Date.now() - start;

      // Log request metrics
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: req.get('user-agent'),
        ip: req.ip,
      };

      // Update span with response data
      if (span) {
        span.setAttributes({
          'http.status_code': res.statusCode,
          'http.response_content_length': res.get('content-length') || 0,
          'http.duration_ms': duration,
        });

        // Set span status based on status code
        if (res.statusCode >= 500) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `HTTP ${res.statusCode}`,
          });
        } else if (res.statusCode >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `Client error: ${res.statusCode}`,
          });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        // Add performance warnings
        if (duration > 2000) {
          const threshold_ms = 2000;
          const actual_ms = duration;
          span.addEvent('slow_request', {
            threshold_ms,
            actual_ms,
          });
        }

        // End the span
        span.end();
      }

      // Log for now (in addition to telemetry)
      if (res.statusCode >= 500) {
        console.error('Server Error:', logData);
      } else if (duration > 2000) {
        console.warn('Slow Request:', logData);
      }
    });

    next();
  }
}
