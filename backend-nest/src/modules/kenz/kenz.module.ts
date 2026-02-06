import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kenz, KenzSchema } from './entities/kenz.entity';
import { KenzReport, KenzReportSchema } from './entities/kenz-report.entity';
import { KenzCategory, KenzCategorySchema } from './entities/kenz-category.entity';
import { KenzFavorite, KenzFavoriteSchema } from './entities/kenz-favorite.entity';
import { KenzBoost, KenzBoostSchema } from './entities/kenz-boost.entity';
import { KenzController } from './kenz.controller';
import { KenzService } from './kenz.service';
import { KenzCategoryService } from './kenz-category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kenz.name, schema: KenzSchema },
      { name: KenzReport.name, schema: KenzReportSchema },
      { name: KenzCategory.name, schema: KenzCategorySchema },
      { name: KenzFavorite.name, schema: KenzFavoriteSchema },
      { name: KenzBoost.name, schema: KenzBoostSchema },
    ]),
  ],
  controllers: [KenzController],
  providers: [KenzService, KenzCategoryService],
  exports: [KenzService, KenzCategoryService],
})
export class KenzModule {} 
