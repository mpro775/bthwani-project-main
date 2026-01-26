import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kenz, KenzSchema } from './entities/kenz.entity';
import { KenzController } from './kenz.controller';
import { KenzService } from './kenz.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Kenz.name, schema: KenzSchema }]),
    
  ],
  controllers: [KenzController],
  providers: [KenzService],
  exports: [KenzService],
})
export class KenzModule {} 
