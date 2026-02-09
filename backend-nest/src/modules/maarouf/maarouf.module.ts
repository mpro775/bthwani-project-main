import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Maarouf, MaaroufSchema } from './entities/maarouf.entity';
import { RewardHold, RewardHoldSchema } from './entities/reward-hold.entity';
import { MaaroufController } from './maarouf.controller';
import { MaaroufService } from './maarouf.service';
import { RewardHoldService } from './reward-hold.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Maarouf.name, schema: MaaroufSchema },
      { name: RewardHold.name, schema: RewardHoldSchema },
    ]),
    JwtModule.register({}),
    ConfigModule,
    ScheduleModule,
    WalletModule,
  ],
  controllers: [MaaroufController],
  providers: [MaaroufService, RewardHoldService],
  exports: [MaaroufService, RewardHoldService],
})
export class MaaroufModule {} 
