import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UtilityController } from './utility.controller';
import { UtilityService } from './services/utility.service';
import { UtilityOrderService } from './services/utility-order.service';
import {
  UtilityPricing,
  UtilityPricingSchema,
} from './entities/utility-pricing.entity';
import {
  DailyPrice,
  DailyPriceSchema,
} from './entities/daily-price.entity';
import {
  UtilityOrder,
  UtilityOrderSchema,
} from './entities/utility-order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UtilityPricing.name, schema: UtilityPricingSchema },
      { name: DailyPrice.name, schema: DailyPriceSchema },
      { name: UtilityOrder.name, schema: UtilityOrderSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [UtilityController],
  providers: [UtilityService, UtilityOrderService],
  exports: [UtilityService, UtilityOrderService],
})
export class UtilityModule {}
