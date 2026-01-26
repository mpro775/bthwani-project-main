import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

// تنسيق مخصص للـ logs
const customFormat = winston.format.printf(({ timestamp, level, message, context, trace }) => {
  return `${timestamp} [${level.toUpperCase()}] ${context ? `[${context}]` : ''} ${message}${trace ? `\n${trace}` : ''}`;
});

// تكوين الـ transports بناءً على البيئة
const transports: winston.transport[] = [
  // Console Transport - للتطوير والإنتاج
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      customFormat,
    ),
  }),
];

// في الإنتاج، أضف File transports
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error logs - للأخطاء فقط
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs - جميع المستويات
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // Warn logs - للتحذيرات
    new winston.transports.File({
      filename: path.join('logs', 'warn.log'),
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  );
} else {
  // في التطوير، استخدم ملف واحد للـ debugging
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'debug.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 2,
    }),
  );
}

// إنشاء Logger instance
export const logger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],
});

