import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { RoasDaily, RoasDailySchema } from './entities/roas-daily.entity';
import { AdSpend, AdSpendSchema } from './entities/adspend.entity';
import {
  MarketingEvent,
  MarketingEventSchema,
} from './entities/marketing-event.entity';
import { Order, OrderSchema } from '../order/entities/order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoasDaily.name, schema: RoasDailySchema },
      { name: AdSpend.name, schema: AdSpendSchema },
      { name: MarketingEvent.name, schema: MarketingEventSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
