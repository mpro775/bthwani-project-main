import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WithdrawalService } from './withdrawal.service';
import { Withdrawal, WithdrawalSchema } from './entities/withdrawal.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdrawal.name, schema: WithdrawalSchema }
    ]),
    forwardRef(() => WalletModule),
  ],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
