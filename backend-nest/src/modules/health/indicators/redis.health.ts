import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  /**
   * فحص صحة اتصال Redis/Cache
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = '__health_check__';
      const testValue = Date.now().toString();

      // محاولة الكتابة
      await this.cacheManager.set(testKey, testValue, 10000); // 10 seconds TTL

      // محاولة القراءة
      const retrievedValue = await this.cacheManager.get(testKey);

      // التحقق من التطابق
      const isHealthy = retrievedValue === testValue;

      // حذف المفتاح
      await this.cacheManager.del(testKey);

      if (isHealthy) {
        return this.getStatus(key, true, {
          message: 'Cache is healthy',
          status: 'up',
        });
      } else {
        throw new Error('Cache read/write mismatch');
      }
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: (error as Error).message || 'Cache connection failed',
        status: 'down',
      });
      throw new HealthCheckError('Redis/Cache health check failed', result);
    }
  }

  /**
   * فحص أداء Redis
   */
  async checkPerformance(
    key: string,
    maxLatencyMs: number = 100,
  ): Promise<HealthIndicatorResult> {
    try {
      const testKey = '__performance_check__';
      const testValue = 'performance_test';

      // قياس وقت الاستجابة
      const startTime = Date.now();

      await this.cacheManager.set(testKey, testValue, 5000);
      await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);

      const latency = Date.now() - startTime;

      const isHealthy = latency <= maxLatencyMs;

      if (isHealthy) {
        return this.getStatus(key, true, {
          latencyMs: latency,
          threshold: maxLatencyMs,
          status: 'optimal',
        });
      } else {
        return this.getStatus(key, false, {
          latencyMs: latency,
          threshold: maxLatencyMs,
          status: 'slow',
          message: `Cache latency ${latency}ms exceeds threshold ${maxLatencyMs}ms`,
        });
      }
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: (error as Error).message || 'Cache performance check failed',
        status: 'error',
      });
      throw new HealthCheckError('Cache performance check failed', result);
    }
  }
}
