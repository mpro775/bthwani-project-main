import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PricingStrategy,
  PricingStrategySchema,
} from './entities/pricing-strategy.entity';
import { PricingStrategyController } from './pricing-strategy.controller';
import { PricingStrategyService } from './pricing-strategy.service';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingStrategy.name, schema: PricingStrategySchema },
    ]),
    AuthModule,
  ],
  controllers: [PricingStrategyController],
  providers: [PricingStrategyService, RolesGuard],
  exports: [PricingStrategyService],
})
export class PricingStrategyModule {}
