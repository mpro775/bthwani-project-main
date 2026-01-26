import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly STAMPEDE_PROTECTION_TTL = 30; // 30 seconds for stampede protection
  private readonly CACHE_PREFIX = 'cache:';
  private readonly LOCK_PREFIX = 'lock:';

  // Stampede protection locks
  private activeLocks = new Set<string>();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Get data from cache with stampede protection
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.getFullKey(key, options.keyPrefix);

    try {
      const cached = await this.redis.get(fullKey);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Update access statistics
      entry.hits++;
      entry.lastAccessed = Date.now();
      await this.redis.setex(fullKey, entry.ttl, JSON.stringify(entry));

      return entry.data;

    } catch (error) {
      this.logger.error(`Cache get failed for key ${fullKey}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.getFullKey(key, options.keyPrefix);
    const ttl = options.ttl || this.DEFAULT_TTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
    };

    try {
      await this.redis.setex(fullKey, ttl, JSON.stringify(entry));
    } catch (error) {
      this.logger.error(`Cache set failed for key ${fullKey}:`, error);
    }
  }

  /**
   * Get or set with stampede protection
   * Prevents multiple requests from computing the same data simultaneously
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions & {
      stampedeProtection?: boolean;
      lockTimeout?: number;
    } = {}
  ): Promise<T> {
    const fullKey = this.getFullKey(key, options.keyPrefix);

    // First, try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Enable stampede protection by default
    if (options.stampedeProtection !== false) {
      return this.withStampedeProtection(fullKey, factory, options);
    }

    // No stampede protection - compute directly
    const result = await factory();
    await this.set(key, result, options);
    return result;
  }

  /**
   * Execute factory function with stampede protection
   */
  private async withStampedeProtection<T>(
    fullKey: string,
    factory: () => Promise<T>,
    options: CacheOptions & { lockTimeout?: number } = {}
  ): Promise<T> {
    const lockKey = `${this.LOCK_PREFIX}${fullKey}`;
    const lockTimeout = options.lockTimeout || this.STAMPEDE_PROTECTION_TTL;

    // Try to acquire lock
    const lockAcquired = await this.acquireLock(lockKey, lockTimeout);
    if (!lockAcquired) {
      // Another process is computing this data
      // Wait a bit and try to get from cache again
      await this.sleep(100);
      const cached = await this.get<T>(fullKey.replace(this.CACHE_PREFIX, ''), options);
      if (cached !== null) {
        return cached;
      }

      // Still not available, wait a bit more
      await this.sleep(200);
      const cached2 = await this.get<T>(fullKey.replace(this.CACHE_PREFIX, ''), options);
      if (cached2 !== null) {
        return cached2;
      }

      // Fallback to computing (lock might have expired)
      this.logger.warn(`Stampede protection fallback for key: ${fullKey}`);
    }

    try {
      // Compute the value
      const result = await factory();

      // Cache the result
      const cacheKey = fullKey.replace(this.CACHE_PREFIX, '');
      await this.set(cacheKey, result, options);

      return result;

    } finally {
      // Always release the lock
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string, keyPrefix?: string): Promise<boolean> {
    const fullKey = this.getFullKey(key, keyPrefix);

    try {
      const result = await this.redis.del(fullKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache delete failed for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async deletePattern(pattern: string, keyPrefix?: string): Promise<number> {
    try {
      const fullPattern = this.getFullKey(pattern, keyPrefix);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.logger.log(`Deleted ${result} cache entries matching pattern: ${fullPattern}`);
      return result;

    } catch (error) {
      this.logger.error(`Cache delete pattern failed for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(keyPrefix?: string): Promise<number> {
    const pattern = keyPrefix ? `${keyPrefix}:*` : `${this.CACHE_PREFIX}*`;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.logger.log(`Cleared ${result} cache entries`);
      return result;

    } catch (error) {
      this.logger.error('Cache clear failed:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      const lockKeys = await this.redis.keys(`${this.LOCK_PREFIX}*`);

      return {
        totalKeys: keys.length,
        totalLocks: lockKeys.length,
        redis: {
          connected_clients: info.match(/connected_clients:(\d+)/)?.[1],
          used_memory: info.match(/used_memory:(\d+)/)?.[1],
          total_connections_received: info.match(/total_connections_received:(\d+)/)?.[1],
        },
        activeLocks: this.activeLocks.size,
      };

    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Acquire distributed lock
   */
  private async acquireLock(lockKey: string, timeoutSeconds: number): Promise<boolean> {
    try {
      // Use Redis SET with NX (not exists) and EX (expire)
      const result = await this.redis.set(lockKey, '1', 'EX', timeoutSeconds, 'NX');
      const acquired = result === 'OK';

      if (acquired) {
        this.activeLocks.add(lockKey);
      }

      return acquired;

    } catch (error) {
      this.logger.error(`Failed to acquire lock ${lockKey}:`, error);
      return false;
    }
  }

  /**
   * Release distributed lock
   */
  private async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.redis.del(lockKey);
      this.activeLocks.delete(lockKey);
    } catch (error) {
      this.logger.error(`Failed to release lock ${lockKey}:`, error);
    }
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string, keyPrefix?: string): string {
    const prefix = keyPrefix || this.CACHE_PREFIX;
    return `${prefix}${key}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache(): Promise<void> {
    this.logger.log('Starting cache warming...');

    // Warm frequently accessed data
    // This should be customized based on your application needs

    try {
      // Example: Warm user preferences cache
      // await this.warmUserPreferences();

      // Example: Warm system configuration
      // await this.warmSystemConfig();

      this.logger.log('Cache warming completed');

    } catch (error) {
      this.logger.error('Cache warming failed:', error);
    }
  }

  /**
   * Daily cache maintenance
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dailyCacheMaintenance(): Promise<void> {
    this.logger.log('Running daily cache maintenance...');

    try {
      // Clean up expired locks (safety net)
      const lockKeys = await this.redis.keys(`${this.LOCK_PREFIX}*`);
      if (lockKeys.length > 0) {
        // Check each lock and clean up stale ones
        for (const lockKey of lockKeys) {
          const ttl = await this.redis.ttl(lockKey);
          if (ttl === -2) { // Key doesn't exist
            this.activeLocks.delete(lockKey);
          }
        }
      }

      // Get and log cache statistics
      const stats = await this.getStats();
      this.logger.log('Cache maintenance completed', stats);

    } catch (error) {
      this.logger.error('Daily cache maintenance failed:', error);
    }
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Cache health check failed:', error);
      return false;
    }
  }
}
