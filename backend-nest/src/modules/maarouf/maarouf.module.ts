import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Maarouf, MaaroufSchema } from './entities/maarouf.entity';
import { MaaroufController } from './maarouf.controller';
import { MaaroufService } from './maarouf.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Maarouf.name, schema: MaaroufSchema }]),
    JwtModule.register({}),
  ],
  controllers: [MaaroufController],
  providers: [MaaroufService],
  exports: [MaaroufService],
})
export class MaaroufModule {} 
