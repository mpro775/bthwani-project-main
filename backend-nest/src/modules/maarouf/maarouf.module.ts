import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Maarouf, MaaroufSchema } from './entities/maarouf.entity';
import { MaaroufController } from './maarouf.controller';
import { MaaroufService } from './maarouf.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Maarouf.name, schema: MaaroufSchema }]),
    
  ],
  controllers: [MaaroufController],
  providers: [MaaroufService],
  exports: [MaaroufService],
})
export class MaaroufModule {} 
