import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { AppLoggerService } from './common/services/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { RuntimeTapInterceptor } from './common/interceptors/runtime-tap.interceptor';
import { RuntimeTapService } from './common/services/runtime-tap.service';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { OrderModule } from './modules/order/order.module';
import { DriverModule } from './modules/driver/driver.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { StoreModule } from './modules/store/store.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CartModule } from './modules/cart/cart.module';
import { UtilityModule } from './modules/utility/utility.module';
import { AkhdimniModule } from './modules/akhdimni/akhdimni.module';
import { AmaniModule } from './modules/amani/amani.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ContentModule } from './modules/content/content.module';
import { ERModule } from './modules/er/er.module';
import { Es3afniModule } from './modules/es3afni/es3afni.module';
import { GatewaysModule } from './gateways/gateways.module';
import { MarketerModule } from './modules/marketer/marketer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ArabonModule } from './modules/arabon/arabon.module';
import { LegalModule } from './modules/legal/legal.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { QueuesModule } from './queues/queues.module';
import { KawaderModule } from './modules/kawader/kawader.module';
import { KenzModule } from './modules/kenz/kenz.module';
import { KenzChatModule } from './modules/kenz-chat/kenz-chat.module';
import { KawaderChatModule } from './modules/kawader-chat/kawader-chat.module';
import { MaaroufModule } from './modules/maarouf/maarouf.module';
import { MaaroufChatModule } from './modules/maarouf-chat/maarouf-chat.module';
import { SanadModule } from './modules/sanad/sanad.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CommonModule } from './common/common.module';
import { IdempotencyMiddleware } from './common/middleware/idempotency.middleware';

// Import configurations
import databaseConfig from './config/database.config';
import cacheConfig from './config/cache.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    // Configuration Module with Validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cacheConfig, jwtConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true, // السماح بمتغيرات إضافية
        abortEarly: false, // عرض جميع الأخطاء مرة واحدة
      },
    }),

    // Database Module
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri =
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/bthwani';

        if (!uri || uri === 'mongodb://localhost:27017/bthwani') {
          console.warn(
            '⚠️  Warning: Using default MongoDB URI. Make sure MONGODB_URI is set in .env file',
          );
        } else {
          console.log('✅ MongoDB URI loaded from environment');
          console.log('🔗 Connecting to:', uri.replace(/:[^:@]+@/, ':****@'));
        }

        // Simplified options - let Mongoose use defaults for most settings
        const options: any = {
          // Connection timeouts
          serverSelectionTimeoutMS: 60000, // 60 seconds - increased significantly
          connectTimeoutMS: 60000, // 60 seconds
          socketTimeoutMS: 0, // No timeout - let it wait

          // Connection pool
          maxPoolSize: 10,
          minPoolSize: 1, // Reduced from 2 to 1

          // Reliability
          retryWrites: true,
          retryReads: true,
        };

        return {
          uri,
          ...options,
        };
      },
    }),

    // Cache Module
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL || '600', 10),
      max: parseInt(process.env.CACHE_MAX_ITEMS || '100', 10),
    }),

    // Rate Limiting Module ✨
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 ثانية
        limit: 100, // 100 طلب في الدقيقة (افتراضي)
      },
      {
        name: 'strict',
        ttl: 60000, // 60 ثانية
        limit: 10, // 10 طلبات في الدقيقة (للعمليات الحساسة)
      },
      {
        name: 'auth',
        ttl: 60000, // 60 ثانية
        limit: 5, // 5 محاولات تسجيل دخول في الدقيقة
      },
    ]),

    // Event Emitter Module (Global)
    EventEmitterModule.forRoot(),

    // Feature Modules
    AuthModule,

    WalletModule,

    OrderModule,

    DriverModule,

    VendorModule,

    StoreModule,

    UserModule,

    NotificationModule,

    AdminModule,

    FinanceModule,

    CartModule,

    UtilityModule,

    AkhdimniModule,

    AmaniModule,

    PromotionModule,

    MerchantModule,

    ContentModule,

    ERModule,

    Es3afniModule,

    MarketerModule,

    AnalyticsModule,

    ArabonModule,

    LegalModule,

    KawaderModule,

    KenzModule,

    KenzChatModule,

    KawaderChatModule,

    MaaroufModule,
    MaaroufChatModule,
    MaaroufChatModule,

    SanadModule,

    PaymentsModule,

    FavoritesModule,

    // Health Check & Metrics
    HealthModule,
    MetricsModule,

    // Background Jobs & Queues
    QueuesModule,

    // WebSocket Gateways
    GatewaysModule,

    // Common Module (for shared services and models)
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CorrelationIdMiddleware,
    AppLoggerService,
    RuntimeTapService,
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RuntimeTapInterceptor,
    },
    // ✨ Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, IdempotencyMiddleware)
      .forRoutes('*'); // يطبق على جميع المسارات
  }
}
