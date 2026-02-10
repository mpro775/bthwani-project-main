import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kawader, KawaderSchema } from './entities/kawader.entity';
import { KawaderApplication, KawaderApplicationSchema } from './entities/kawader-application.entity';
import { KawaderPortfolio, KawaderPortfolioSchema } from './entities/kawader-portfolio.entity';
import { KawaderReview, KawaderReviewSchema } from './entities/kawader-review.entity';
import { KawaderMedia, KawaderMediaSchema } from './entities/kawader-media.entity';
import { KawaderController } from './kawader.controller';
import { KawaderService } from './kawader.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kawader.name, schema: KawaderSchema },
      { name: KawaderApplication.name, schema: KawaderApplicationSchema },
      { name: KawaderPortfolio.name, schema: KawaderPortfolioSchema },
      { name: KawaderReview.name, schema: KawaderReviewSchema },
      { name: KawaderMedia.name, schema: KawaderMediaSchema },
    ]),
  ],
  controllers: [KawaderController],
  providers: [KawaderService],
  exports: [KawaderService],
})
export class KawaderModule {} 
