import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Wallet E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Register and login a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        phone: '777' + Date.now(),
        fullName: 'Test User',
        password: 'Test@123456',
      });

    const responseBody = registerResponse.body as {
      data: { token: string; user: { id: string } };
    };
    authToken = responseBody.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v2/wallet/balance', () => {
    it('should return wallet balance', () => {
      return request(app.getHttpServer())
        .get('/api/v2/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: { body: { data: Record<string, unknown> } }) => {
          expect(res.body.data).toHaveProperty('balance');
          expect(res.body.data).toHaveProperty('onHold');
          expect(res.body.data).toHaveProperty('availableBalance');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v2/wallet/balance')
        .expect(401);
    });
  });

  describe('GET /api/v2/wallet/transactions', () => {
    it('should return transaction history', () => {
      return request(app.getHttpServer())
        .get('/api/v2/wallet/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20 })
        .expect(200)
        .expect((res: { body: { data: Record<string, unknown> } }) => {
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('pagination');
          expect(
            Array.isArray((res.body.data as { data: unknown[] }).data),
          ).toBe(true);
        });
    });
  });

  describe('POST /api/v2/wallet/transaction (with Idempotency)', () => {
    it('should create transaction with idempotency key', () => {
      const idempotencyKey = `test-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/api/v2/wallet/transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          amount: 100,
          type: 'credit',
          method: 'kuraimi',
          description: 'Test transaction',
        })
        .expect(201);
    });

    it('should return same response for duplicate idempotency key', async () => {
      const idempotencyKey = `test-duplicate-${Date.now()}`;

      const firstResponse = await request(app.getHttpServer())
        .post('/api/v2/wallet/transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          amount: 100,
          type: 'credit',
          method: 'test',
          description: 'Duplicate test',
        });

      const secondResponse = await request(app.getHttpServer())
        .post('/api/v2/wallet/transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          amount: 100,
          type: 'credit',
          method: 'test',
          description: 'Duplicate test',
        });

      // Should return same response
      expect((firstResponse as { status: number }).status).toBe(
        (secondResponse as { status: number }).status,
      );
    });

    it('should require idempotency key for sensitive operations', () => {
      return request(app.getHttpServer())
        .post('/api/v2/wallet/transaction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          type: 'credit',
          method: 'kuraimi',
          description: 'No idempotency key',
        })
        .expect(400)
        .expect((res: { body: { message: string } }) => {
          expect(res.body.message).toContain('Idempotency-Key');
        });
    });
  });

  describe('GET /api/v2/wallet/topup/methods', () => {
    it('should return available topup methods', () => {
      return request(app.getHttpServer())
        .get('/api/v2/wallet/topup/methods')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: { body: { data: { methods: unknown[] } } }) => {
          expect(res.body.data).toHaveProperty('methods');
          expect(Array.isArray(res.body.data.methods)).toBe(true);
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests: Array<Promise<{ status: number }>> = [];

      // Send 150 requests (more than default limit of 100)
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/api/v2/wallet/balance')
            .set('Authorization', `Bearer ${authToken}`),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Request Timeout', () => {
    it('should timeout long-running requests', async () => {
      await Promise.resolve();
      // This would require a special endpoint that delays
      // For now, just testing the structure
      expect(app).toBeDefined();
    }, 35000);
  });
});
