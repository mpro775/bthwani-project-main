import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MarketerController } from './marketer.controller';
import { MarketerService } from './marketer.service';
import { Marketer, MarketerSchema } from './entities/marketer.entity';
import { Onboarding, OnboardingSchema } from './entities/onboarding.entity';
import {
  ReferralEvent,
  ReferralEventSchema,
} from './entities/referral-event.entity';
import {
  CommissionPlan,
  CommissionPlanSchema,
} from './entities/commission-plan.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Marketer.name, schema: MarketerSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: ReferralEvent.name, schema: ReferralEventSchema },
      { name: CommissionPlan.name, schema: CommissionPlanSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [MarketerController],
  providers: [MarketerService],
  exports: [MarketerService],
})
export class MarketerModule {}
