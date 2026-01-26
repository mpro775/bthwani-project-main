import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { IdempotencyRecord, IdempotencyRecordSchema } from './entities/idempotency.entity';
import { SettlementRecord, SettlementRecordSchema } from './entities/settlement.entity';
import { PerformanceMetric, PerformanceMetricSchema, PerformanceBudget, PerformanceBudgetSchema } from './entities/performance.entity';
import { WalletTransaction, WalletTransactionSchema } from '../modules/wallet/entities/wallet-transaction.entity';
import { IdempotencyService } from './services/idempotency.service';
import { DailySettlementService } from './services/daily-settlement.service';
import { PerformanceService } from './services/performance.service';
import { DatabaseIndexService } from './services/database-index.service';
import { CacheService } from './services/cache.service';
import { IdempotencyMiddleware } from './middleware/idempotency.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        
        return {
          type: 'single',
          url: redisUrl || `redis://${redisHost}:${redisPort}`,
          options: {
            password: configService.get<string>('REDIS_PASSWORD'),
            db: configService.get<number>('REDIS_DB', 0),
            ...(configService.get<string>('REDIS_TLS') === 'true' && {
              tls: {},
            }),
          },
        };
      },
    }),
    MongooseModule.forFeature([
      { name: IdempotencyRecord.name, schema: IdempotencyRecordSchema },
      { name: SettlementRecord.name, schema: SettlementRecordSchema },
      { name: PerformanceMetric.name, schema: PerformanceMetricSchema },
      { name: PerformanceBudget.name, schema: PerformanceBudgetSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  providers: [IdempotencyService, DailySettlementService, PerformanceService, DatabaseIndexService, CacheService, IdempotencyMiddleware],
  exports: [
    IdempotencyService,
    DailySettlementService,
    PerformanceService,
    DatabaseIndexService,
    CacheService,
    IdempotencyMiddleware,
    MongooseModule, // Export MongooseModule so models are available to other modules
  ],
})
export class CommonModule {}
