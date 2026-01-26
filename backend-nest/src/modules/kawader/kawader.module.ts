import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kawader, KawaderSchema } from './entities/kawader.entity';
import { KawaderController } from './kawader.controller';
import { KawaderService } from './kawader.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Kawader.name, schema: KawaderSchema }]),
    
  ],
  controllers: [KawaderController],
  providers: [KawaderService],
  exports: [KawaderService],
})
export class KawaderModule {} 
