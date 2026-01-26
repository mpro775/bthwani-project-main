import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { WalletController } from './wallet.controller';
import { V2WalletController } from './v2-wallet.controller';
import { WalletService } from './wallet.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './entities/wallet-transaction.entity';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { FinanceModule } from '../finance/finance.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    JwtModule.register({}),
    forwardRef(() => WithdrawalModule),
    forwardRef(() => FinanceModule),
    forwardRef(() => ContentModule),
  ],
  controllers: [WalletController, V2WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
