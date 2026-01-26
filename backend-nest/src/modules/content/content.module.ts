import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ContentController } from './content.controller';
import { ContentService } from './services/content.service';
import { Banner, BannerSchema } from './entities/banner.entity';
import {
  StoreSection,
  StoreSectionSchema,
} from './entities/store-section.entity';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
  UserSubscription,
  UserSubscriptionSchema,
} from './entities/subscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: StoreSection.name, schema: StoreSectionSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
