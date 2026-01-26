import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Application
  name: process.env.APP_NAME || 'Bthwani API',
  version: process.env.APP_VERSION || '2.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],

  // API
  apiPrefix: process.env.API_PREFIX || 'api/v2',

  // Rate Limiting
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // seconds
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // requests

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
}));
