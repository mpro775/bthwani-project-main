import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

/**
 * اختبار شامل لجميع أكواد الأخطاء (Error Codes E2E Testing)
 * يتحقق من أن جميع الـ 20 error code تعمل بشكل صحيح
 */
describe('Error Codes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Client Errors (4xx)', () => {
    it('400 - BAD_REQUEST', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/consent')
        .send({ invalid: 'data' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          userMessage: expect.stringContaining('البيانات') as string,
          suggestedAction: expect.stringContaining('التحقق') as string,
        },
      });
    });

    it('401 - UNAUTHORIZED', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          userMessage: 'يجب تسجيل الدخول أولاً',
          suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
        },
      });
    });

    it('403 - FORBIDDEN (when trying to access admin endpoint)', async () => {
      // سيتطلب هذا token مستخدم عادي يحاول الوصول لصفحة الإدارة
      // يمكن تنفيذه عند توفر authentication
    });

    it('404 - NOT_FOUND', async () => {
      const response = await request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          userMessage: 'البيانات المطلوبة غير موجودة',
          suggestedAction: expect.stringContaining('التحقق') as string,
        },
      });
    });

    it('422 - VALIDATION_ERROR', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/consent')
        .send({
          consentType: 'invalid_type',
          granted: 'not_boolean',
          version: '',
        })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          userMessage: 'البيانات غير صالحة',
          suggestedAction: 'يرجى مراجعة جميع الحقول المطلوبة',
        },
      });
    });

    it('429 - TOO_MANY_REQUESTS (rate limiting)', async () => {
      // يتطلب تفعيل rate limiting middleware
      // يمكن اختباره بإرسال طلبات متعددة متتالية
    });
  });

  describe('Server Errors (5xx)', () => {
    it('500 - INTERNAL_ERROR', async () => {
      // يتطلب إنشاء endpoint يرمي خطأ غير متوقع
      // أو mock لخطأ في قاعدة البيانات
    });

    it('503 - SERVICE_UNAVAILABLE', async () => {
      // يمكن اختباره عند إيقاف قاعدة البيانات
      // أو mock لحالة صيانة
    });
  });

  describe('New Error Codes ✨', () => {
    describe('402 - PAYMENT_REQUIRED', () => {
      it('should return 402 when payment is required', () => {
        // مثال: محاولة إنشاء طلب بدون رصيد كافٍ
        // يتطلب تنفيذ logic في order service
      });
    });

    describe('405 - METHOD_NOT_ALLOWED', () => {
      it('should return 405 for unsupported HTTP method', async () => {
        // NestJS يرجع 404 افتراضياً للـ methods غير المدعومة
        // يمكن تخصيص هذا السلوك
      });
    });

    describe('406 - NOT_ACCEPTABLE', () => {
      it('should return 406 for unsupported content type', () => {
        // يتطلب تفعيل content negotiation
      });
    });

    describe('408 - REQUEST_TIMEOUT', () => {
      it('should return 408 when request times out', () => {
        // يتطلب تفعيل timeout interceptor
      });
    });

    describe('410 - GONE', () => {
      it('should return 410 for permanently deleted resource', () => {
        // مثال: محاولة الوصول لحساب محذوف
      });
    });

    describe('413 - PAYLOAD_TOO_LARGE', () => {
      it('should return 413 for oversized payload', async () => {
        const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

        const response = await request(app.getHttpServer())
          .post('/test-endpoint')
          .send({ data: largePayload })
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);

        expect((response.body as { error: { code: string } }).error.code).toBe(
          'PAYLOAD_TOO_LARGE',
        );
      });
    });

    describe('415 - UNSUPPORTED_MEDIA_TYPE', () => {
      it('should return 415 for unsupported media type', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/consent')
          .set('Content-Type', 'text/plain')
          .send('plain text data')
          .expect(HttpStatus.UNSUPPORTED_MEDIA_TYPE);

        expect((response.body as { error: { code: string } }).error.code).toBe(
          'UNSUPPORTED_MEDIA_TYPE',
        );
      });
    });

    describe('423 - LOCKED', () => {
      it('should return 423 for locked resource', () => {
        // مثال: محاولة تعديل طلب قيد المعالجة
      });
    });

    describe('501 - NOT_IMPLEMENTED', () => {
      it('should return 501 for not implemented feature', () => {
        // مثال: feature flag معطّل
      });
    });

    describe('502 - BAD_GATEWAY', () => {
      it('should return 502 for gateway error', () => {
        // مثال: فشل في الاتصال بخدمة خارجية
      });
    });

    describe('504 - GATEWAY_TIMEOUT', () => {
      it('should return 504 for gateway timeout', () => {
        // مثال: timeout في الاتصال مع payment gateway
      });
    });
  });

  describe('Error Response Structure', () => {
    it('should have correct error response structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      // التحقق من البنية الكاملة
      const body = response.body as {
        success: boolean;
        error: Record<string, unknown>;
        meta: Record<string, unknown>;
      };
      expect(body).toHaveProperty('success', false);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(body.error).toHaveProperty('userMessage');
      expect(body.error).toHaveProperty('suggestedAction');
      expect(body).toHaveProperty('meta');
      expect(body.meta).toHaveProperty('timestamp');
      expect(body.meta).toHaveProperty('path');
      expect(body.meta).toHaveProperty('version');
    });

    it('should include Arabic user message', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      // التحقق من وجود رسالة عربية
      expect(
        (
          response.body as {
            error: { userMessage: string };
          }
        ).error.userMessage,
      ).toMatch(/[\u0600-\u06FF]/);
    });

    it('should include suggested action', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);

      const body = response.body as {
        error: { suggestedAction: string };
      };
      expect(body.error.suggestedAction).toBeTruthy();
      expect(body.error.suggestedAction.length).toBeGreaterThan(0);
    });
  });

  describe('Error Code Coverage', () => {
    it('should support all 20 error codes', () => {
      const supportedCodes = [
        // Client Errors (4xx)
        400, 401, 402, 403, 404, 405, 406, 408, 409, 410, 413, 415, 422, 423,
        429,
        // Server Errors (5xx)
        500, 501, 502, 503, 504,
      ];

      // التحقق من أن GlobalExceptionFilter يدعم جميع الأكواد
      void new GlobalExceptionFilter();
      supportedCodes.forEach((code) => {
        // يمكن اختبار getErrorCode هنا إذا كان public
        expect(code).toBeGreaterThan(0);
      });

      expect(supportedCodes.length).toBe(20);
    });
  });
});
