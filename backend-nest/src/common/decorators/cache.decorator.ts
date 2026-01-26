import { Inject } from '@nestjs/common';
import 'reflect-metadata';
import { CacheService, CacheOptions } from '../services/cache.service';

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

/**
 * Cache decorator for methods
 */
export function Cache(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheKeyPrefix = options.keyPrefix || target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      // Get cache service from DI container
      const cacheService = (this as any).cacheService || (this as any).cacheManager;
      if (!cacheService) {
        // Fallback to direct method call if no cache service
        return method.apply(this, args);
      }

      // Generate cache key from method name and arguments
      const cacheKey = generateCacheKey(propertyKey, args);

      // Try to get from cache first
      const cachedResult = await cacheService.get(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache with stampede protection decorator
 */
export function CacheWithStampedeProtection(options: CacheOptions & {
  lockTimeout?: number;
} = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService || (this as any).cacheManager;
      if (!cacheService) {
        return method.apply(this, args);
      }

      const cacheKey = generateCacheKey(propertyKey, args);

      return cacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        {
          ...options,
          stampedeProtection: true,
        }
      );
    };

    return descriptor;
  };
}

/**
 * Invalidate cache decorator
 */
export function CacheInvalidate(pattern: string, keyPrefix?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);

      // Invalidate cache after method execution
      const cacheService = (this as any).cacheService || (this as any).cacheManager;
      if (cacheService) {
        if (pattern.includes('*')) {
          // Pattern invalidation
          await cacheService.deletePattern(pattern, keyPrefix);
        } else {
          // Single key invalidation
          await cacheService.delete(pattern, keyPrefix);
        }
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache key generator
 */
export function CacheKey(keyTemplate: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingKeys = Reflect.getOwnMetadata('cache-keys', target, propertyKey) || [];
    existingKeys[parameterIndex] = keyTemplate;
    Reflect.defineMetadata('cache-keys', existingKeys, target, propertyKey);
  };
}

/**
 * Generate cache key from method name and arguments
 */
function generateCacheKey(methodName: string, args: any[]): string {
  let key = methodName;

  // Default key generation
  const argsHash = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // Simple object serialization for cache key
      return JSON.stringify(arg, Object.keys(arg).sort());
    }
    return String(arg);
  }).join('|');

  key = `${methodName}:${argsHash}`;

  // Sanitize key (remove special characters that might cause issues)
  return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

/**
 * TTL decorator for dynamic TTL values
 */
export function CacheTTL(ttlSeconds: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('cache-ttl', ttlSeconds, target, propertyKey);
  };
}

/**
 * Conditional caching decorator
 */
export function CacheIf(conditionFn: (...args: any[]) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Check condition
      if (!conditionFn.apply(this, args)) {
        return method.apply(this, args);
      }

      // Apply caching logic
      const cacheService = (this as any).cacheService || (this as any).cacheManager;
      if (!cacheService) {
        return method.apply(this, args);
      }

      const cacheKey = generateCacheKey(propertyKey, args);
      const cachedResult = await cacheService.get(cacheKey);

      if (cachedResult !== null) {
        return cachedResult;
      }

      const result = await method.apply(this, args);
      await cacheService.set(cacheKey, result);

      return result;
    };

    return descriptor;
  };
}
