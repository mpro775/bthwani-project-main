import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError, retry, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  excludePaths: string[];
}

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RetryInterceptor.name);
  private readonly config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'],
      excludePaths: ['/health', '/metrics'],
      ...config,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Skip retry for excluded paths
    if (this.config.excludePaths.some(excluded => path.includes(excluded))) {
      return next.handle();
    }

    let retryCount = 0;

    return next.handle().pipe(
      retry({
        count: this.config.maxRetries,
        delay: (error, retryIndex) => {
          retryCount = retryIndex;

          // Check if error is retryable
          if (!this.isRetryableError(error)) {
            this.logger.warn(
              `Non-retryable error for ${request.method} ${path}: ${error.message}`
            );
            throw error;
          }

          const delay = this.config.delayMs * Math.pow(this.config.backoffMultiplier, retryIndex - 1);

          this.logger.warn(
            `Retrying ${request.method} ${path} (attempt ${retryIndex}/${this.config.maxRetries}) after ${delay}ms: ${error.message}`
          );

          return timer(delay);
        },
      }),
      catchError((error) => {
        if (retryCount > 0) {
          this.logger.error(
            `All retry attempts failed for ${request.method} ${path} after ${retryCount} retries: ${error.message}`
          );
        }
        throw error;
      }),
      tap(() => {
        if (retryCount > 0) {
          this.logger.log(
            `Request ${request.method} ${path} succeeded after ${retryCount} retries`
          );
        }
      })
    );
  }

  private isRetryableError(error: any): boolean {
    if (!error) return false;

    // Check error code
    if (error.code && this.config.retryableErrors.includes(error.code)) {
      return true;
    }

    // Check error name
    if (error.name && this.config.retryableErrors.includes(error.name)) {
      return true;
    }

    // Check status code for HTTP errors
    if (error.status) {
      // Retry on 5xx errors and specific 4xx errors
      return error.status >= 500 || [408, 429].includes(error.status);
    }

    // Check MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      return true;
    }

    return false;
  }
}

// Specialized retry interceptors for different use cases
@Injectable()
export class DatabaseRetryInterceptor extends RetryInterceptor {
  constructor() {
    super({
      maxRetries: 5,
      delayMs: 500,
      backoffMultiplier: 1.5,
      retryableErrors: ['MongoError', 'MongoNetworkError', 'ECONNRESET', 'ETIMEDOUT'],
    });
  }
}

@Injectable()
export class ExternalApiRetryInterceptor extends RetryInterceptor {
  constructor() {
    super({
      maxRetries: 3,
      delayMs: 2000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'],
    });
  }
}

@Injectable()
export class PaymentRetryInterceptor extends RetryInterceptor {
  constructor() {
    super({
      maxRetries: 2, // Lower retries for payments
      delayMs: 3000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
      excludePaths: [], // Don't exclude any payment paths
    });
  }
}
