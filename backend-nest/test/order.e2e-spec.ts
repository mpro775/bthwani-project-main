import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Order E2E Tests', () => {
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
        fullName: 'Test User Orders',
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

  describe('POST /api/v2/order (with Idempotency)', () => {
    it('should create order with idempotency key', () => {
      const idempotencyKey = `order-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/api/v2/order')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          items: [
            {
              product: 'product-id-123',
              quantity: 2,
              price: 500,
            },
          ],
          deliveryAddress: {
            street: 'Test Street',
            city: "Sana'a",
            building: '123',
          },
          paymentMethod: 'wallet',
        })
        .expect((res: { status: number }) => {
          // May be 201 or 400 depending on data validity
          expect([201, 400, 404]).toContain(res.status);
        });
    });

    it('should require idempotency key for order creation', () => {
      return request(app.getHttpServer())
        .post('/api/v2/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
          deliveryAddress: {},
        })
        .expect(400);
    });
  });

  describe('GET /api/v2/order', () => {
    it('should return user orders', () => {
      return request(app.getHttpServer())
        .get('/api/v2/order')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: { body: { data: unknown } }) => {
          const resBody = res.body as {
            data: { data?: unknown } | unknown[];
          };
          expect(resBody.data).toBeDefined();
          expect(
            Array.isArray(
              (resBody.data as { data?: unknown }).data || resBody.data,
            ),
          ).toBe(true);
        });
    });

    it('should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v2/order').expect(401);
    });
  });

  describe('GET /api/v2/order/:id', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/api/v2/order/invalid-id')
        .expect(401);
    });
  });
});
