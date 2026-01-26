import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Server
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v2'),

  // Database
  MONGODB_URI: Joi.string().required().messages({
    'any.required': 'MONGODB_URI is required in .env file',
    'string.empty': 'MONGODB_URI cannot be empty',
  }),

  // JWT Secrets - مطلوبة وقوية
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_SECRET is required in .env file',
    'string.min': 'JWT_SECRET must be at least 32 characters long',
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  VENDOR_JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'VENDOR_JWT_SECRET is required in .env file',
    'string.min': 'VENDOR_JWT_SECRET must be at least 32 characters long',
  }),
  VENDOR_JWT_EXPIRES_IN: Joi.string().default('30d'),

  MARKETER_JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'MARKETER_JWT_SECRET is required in .env file',
    'string.min': 'MARKETER_JWT_SECRET must be at least 32 characters long',
  }),
  MARKETER_JWT_EXPIRES_IN: Joi.string().default('30d'),

  REFRESH_TOKEN_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'REFRESH_TOKEN_SECRET is required in .env file',
    'string.min': 'REFRESH_TOKEN_SECRET must be at least 32 characters long',
  }),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('30d'),

  // Firebase - مطلوبة
  FIREBASE_PROJECT_ID: Joi.string().required().messages({
    'any.required': 'FIREBASE_PROJECT_ID is required in .env file',
  }),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required().messages({
    'any.required': 'FIREBASE_CLIENT_EMAIL is required in .env file',
    'string.email': 'FIREBASE_CLIENT_EMAIL must be a valid email',
  }),
  FIREBASE_PRIVATE_KEY: Joi.string().required().messages({
    'any.required': 'FIREBASE_PRIVATE_KEY is required in .env file',
  }),

  // Redis (Required for Production)
  REDIS_HOST: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().messages({
      'any.required': 'REDIS_HOST is required in production environment',
    }),
    otherwise: Joi.string().default('localhost'),
  }),
  REDIS_PORT: Joi.number()
    .port()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.number().required().messages({
        'any.required': 'REDIS_PORT is required in production environment',
      }),
      otherwise: Joi.number().default(6379),
    }),
  REDIS_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(8).messages({
      'any.required': 'REDIS_PASSWORD is required in production environment',
      'string.min':
        'REDIS_PASSWORD must be at least 8 characters in production',
    }),
    otherwise: Joi.string().optional().allow(''),
  }),
  REDIS_TLS: Joi.boolean().default(false),
  REDIS_DB: Joi.number().default(0),

  // Cache
  CACHE_TTL: Joi.number().default(600),
  CACHE_MAX_ITEMS: Joi.number().default(100),

  // CORS
  CORS_ORIGIN: Joi.string().default('*'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB
  UPLOAD_PATH: Joi.string().default('./uploads'),

  // Rate Limiting (Optional)
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // External APIs (Optional)
  KURAIMI_API_URL: Joi.string().uri().optional(),
  KURAIMI_API_KEY: Joi.string().optional(),

  // SMS Provider (Optional)
  SMS_PROVIDER: Joi.string()
    .valid('twilio', 'yemenm', 'local')
    .default('local'),
  SMS_API_KEY: Joi.string().optional(),

  // Email (Optional)
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),
});
