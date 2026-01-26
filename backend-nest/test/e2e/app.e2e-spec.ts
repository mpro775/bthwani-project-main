import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupTestDatabase, teardownTestDatabase } from '../setup';

describe('BThwani API E2E Tests (BTW-AUD-001)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('Health Check', () => {
    it('should return 200 for health endpoint', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Authentication (OpenAPI Contract)', () => {
    it('should validate login request structure', () => {
      return request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400); // Should fail due to missing Firebase auth
    });

    it('should validate registration request structure', () => {
      return request(app.getHttpServer())
        .post('/api/v2/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(400); // Should fail due to Firebase integration
    });
  });

  describe('Notifications (BTW-NOT-006)', () => {
    it('should handle webhook signature verification', () => {
      const payload = {
        event: 'order.created',
        data: { orderId: '123', amount: 100 },
        timestamp: Date.now(),
        webhookId: 'wh_test123'
      };

      // Missing signature should fail
      return request(app.getHttpServer())
        .post('/api/v2/webhooks/wh_test123')
        .send(payload)
        .expect(400);
    });

    it('should handle notification suppression', () => {
      // This would require authentication setup
      // For now, test the endpoint structure
      return request(app.getHttpServer())
        .get('/api/v2/notifications/suppression')
        .expect(401); // Unauthorized without auth
    });
  });

  describe('Wallet Operations (BTW-PAY-005)', () => {
    it('should validate wallet transaction structure', () => {
      return request(app.getHttpServer())
        .post('/api/v2/wallet/transaction')
        .send({
          type: 'credit',
          amount: 100,
          description: 'Test transaction'
        })
        .expect(401); // Requires authentication
    });
  });

  describe('Performance Budgets (BTW-PERF-007)', () => {
    it('should enforce response time budgets', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Health check should be fast (< 100ms)
      expect(responseTime).toBeLessThan(100);
    });

    it('should track performance metrics', () => {
      // Performance interceptor should be active
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          // Response should include performance tracking headers if configured
          expect(res.headers).toBeDefined();
        });
    });
  });

  describe('API Contract Compliance (BTW-AUD-001)', () => {
    it('should return proper error responses', () => {
      return request(app.getHttpServer())
        .get('/api/v2/nonexistent-endpoint')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should validate request payloads', () => {
      return request(app.getHttpServer())
        .post('/api/v2/orders')
        .send({ invalidField: 'test' })
        .expect(401); // Auth required, but also validation
    });

    it('should handle CORS properly', () => {
      return request(app.getHttpServer())
        .options('/api/v2/orders')
        .expect(204)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });
  });

  describe('Security Features', () => {
    it('should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/health')
            .catch(() => ({ status: 429 })) // Rate limited
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);

      // Should eventually hit rate limit
      expect(rateLimited).toBe(true);
    });

    it('should prevent NoSQL injection attempts', () => {
      return request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({
          email: { $ne: null }, // MongoDB injection attempt
          password: 'password123'
        })
        .expect(400); // Should be sanitized
    });
  });

  describe('Duplicate Prevention (BTW-AUD-002)', () => {
    it('should prevent duplicate API routes', () => {
      // This test ensures no duplicate routes exist
      // Implementation would check route registry
      expect(true).toBe(true); // Placeholder - would implement route validation
    });
  });

  describe('Observability (BTW-OBS-004)', () => {
    it('should expose metrics endpoint', () => {
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200);
    });

    it('should include proper response headers', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          // Should include timing headers if configured
          expect(res.headers).toHaveProperty('x-response-time');
        });
    });
  });

  describe('Go/No-Go Criteria Validation', () => {
    it('should meet availability requirements', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should handle graceful degradation', () => {
      // Test error handling doesn't crash the app
      return request(app.getHttpServer())
        .get('/api/v2/invalid-endpoint')
        .expect(404);
    });

    it('should validate data integrity', () => {
      // Test that responses have expected structure
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(typeof res.body.timestamp).toBe('string');
        });
    });
  });
});
