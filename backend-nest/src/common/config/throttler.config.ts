/**
 * Throttler (Rate Limiting) Configuration
 *
 * يوفر إعدادات محددة مسبقاً لأنواع مختلفة من endpoints
 */

export const ThrottlerConfig = {
  // Default: معدل افتراضي لجميع endpoints
  default: {
    ttl: 60000, // 60 ثانية
    limit: 100, // 100 طلب في الدقيقة
  },

  // Strict: للعمليات الحساسة (تحويلات، سحوبات، إلخ)
  strict: {
    ttl: 60000, // 60 ثانية
    limit: 10, // 10 طلبات في الدقيقة
  },

  // Auth: لمحاولات تسجيل الدخول
  auth: {
    ttl: 60000, // 60 ثانية
    limit: 5, // 5 محاولات في الدقيقة
  },

  // Read: للعمليات القراءة فقط (مخفف جداً)
  read: {
    ttl: 60000, // 60 ثانية
    limit: 500, // 500 طلب في الدقيقة
  },

  // Public: للـ endpoints العامة
  public: {
    ttl: 60000, // 60 ثانية
    limit: 50, // 50 طلب في الدقيقة
  },
};

/**
 * استخدام:
 *
 * Example 1: Inline configuration
 * Throttle({ strict: { ttl: 60000, limit: 10 } })
 * Post('some-endpoint')
 * async someMethod() {}
 *
 * Example 2: Using predefined config
 * Throttle(ThrottlerConfig.strict)
 * Post('another-endpoint')
 * async anotherMethod() {}
 */
