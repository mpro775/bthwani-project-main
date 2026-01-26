import { registerAs } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';

export default registerAs(
  'cache',
  (): CacheModuleOptions => ({
    ttl: parseInt(process.env.CACHE_TTL || '600', 10), // 10 minutes default
    max: parseInt(process.env.CACHE_MAX_ITEMS || '100', 10),
    isGlobal: true,
    // Redis configuration (optional)
    store: process.env.REDIS_HOST ? 'redis' : 'memory',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  }),
);
