import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';

/**
 * Helper class لإدارة الـ caching
 * يوحد منطق الـ cache operations عبر المشروع
 */
export class CacheHelper {
  private static readonly logger = new Logger(CacheHelper.name);

  /**
   * مسح cache بناءً على pattern
   * ملاحظة: يعمل بشكل أفضل مع Redis
   */
  static async invalidatePattern(
    cacheManager: Cache,
    pattern: string,
  ): Promise<void> {
    try {
      // For Redis: use KEYS pattern matching
      // For memory cache: track keys manually
      await cacheManager.del(pattern);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * مسح عدة مفاتيح دفعة واحدة
   */
  static async invalidateMultiple(
    cacheManager: Cache,
    keys: string[],
  ): Promise<void> {
    try {
      await Promise.all(keys.map((key) => cacheManager.del(key)));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to invalidate multiple keys: ${message}`);
    }
  }

  /**
   * مسح cache كيان وجميع علاقاته
   *
   * @example
   * ```typescript
   * await CacheHelper.invalidateEntity(
   *   this.cacheManager,
   *   'order',
   *   orderId,
   *   ['orders:user:{userId}', 'orders:driver:{driverId}']
   * );
   * ```
   */
  static async invalidateEntity(
    cacheManager: Cache,
    entityType: string,
    entityId: string,
    relatedPatterns: string[] = [],
  ): Promise<void> {
    const keys = [
      `${entityType}:${entityId}`,
      ...relatedPatterns.map((pattern) => pattern.replace('{id}', entityId)),
    ];

    await this.invalidateMultiple(cacheManager, keys);
  }

  /**
   * Cache with auto-invalidation
   * جلب من cache أو تنفيذ factory function وحفظ النتيجة
   *
   * @example
   * ```typescript
   * return CacheHelper.getOrSet(
   *   this.cacheManager,
   *   `user:${userId}`,
   *   600,
   *   async () => this.userModel.findById(userId)
   * );
   * ```
   */
  static async getOrSet<T>(
    cacheManager: Cache,
    key: string,
    ttl: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    try {
      // محاولة الحصول من cache
      const cached = await cacheManager.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }

      // تنفيذ factory وحفظ في cache
      const data = await factory();
      await cacheManager.set(key, data, ttl * 1000);
      return data;
    } catch (error) {
      this.logger.error(
        `Cache operation failed for key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // في حالة خطأ في cache، نفذ factory مباشرة
      return factory();
    }
  }

  /**
   * Batch cache invalidation
   * مسح مجموعة من entities من نفس النوع
   */
  static async invalidateBatch(
    cacheManager: Cache,
    entityType: string,
    entityIds: string[],
  ): Promise<void> {
    const keys = entityIds.map((id) => `${entityType}:${id}`);
    await this.invalidateMultiple(cacheManager, keys);
  }

  /**
   * Remember pattern - cache wrapper
   */
  static async remember<T>(
    cacheManager: Cache,
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(cacheManager, key, ttl, callback);
  }

  /**
   * Forget - إزالة من cache
   */
  static async forget(cacheManager: Cache, key: string): Promise<void> {
    await cacheManager.del(key);
  }

  /**
   * Flush - مسح جميع الـ cache
   */
  static async flush(cacheManager: Cache): Promise<void> {
    try {
      // Type assertion needed as reset() may not be in Cache interface
      await (cacheManager as Cache & { reset?: () => Promise<void> }).reset?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to flush cache: ${message}`);
    }
  }

  /**
   * مساعد لبناء cache key
   */
  static buildKey(parts: (string | number)[], separator: string = ':'): string {
    return parts.filter(Boolean).join(separator);
  }
}
