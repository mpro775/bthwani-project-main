import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PromotionController } from './promotion.controller';
import { PromotionsByStoresController } from './promotions-by-stores.controller';
import { PromotionService } from './services/promotion.service';
import { Promotion, PromotionSchema } from './entities/promotion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [PromotionController, PromotionsByStoresController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
