import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Decorator لـ Rate Limiting بأسماء واضحة
 */

// معدل افتراضي: 100 طلب في الدقيقة
export const DefaultThrottle = () => Throttle({ default: { ttl: 60000, limit: 100 } });

// معدل صارم: 10 طلبات في الدقيقة (للعمليات الحساسة)
export const StrictThrottle = () => Throttle({ strict: { ttl: 60000, limit: 10 } });

// معدل للمصادقة: 5 محاولات في الدقيقة
export const AuthThrottle = () => Throttle({ auth: { ttl: 60000, limit: 5 } });

// معدل مخصص
export const CustomThrottle = (limit: number, ttl: number = 60000) => 
  Throttle({ default: { ttl, limit } });

// تعطيل Rate Limiting (للـ endpoints العامة)
export const SkipThrottle = () => SetMetadata('skipThrottle', true);

