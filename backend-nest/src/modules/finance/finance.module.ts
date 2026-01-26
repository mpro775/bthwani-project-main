import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { FinanceController } from './finance.controller';
import { SettlementController } from './settlement.controller';
import { CommonModule } from '../../common/common.module';
import { CommissionService } from './services/commission.service';
import { PayoutService } from './services/payout.service';
import { SettlementService } from './services/settlement.service';
import { CouponService } from './services/coupon.service';
import { ReconciliationService } from './services/reconciliation.service';
import { ReportsService } from './services/reports.service';
import { Commission, CommissionSchema } from './entities/commission.entity';
import { PayoutBatch, PayoutBatchSchema } from './entities/payout-batch.entity';
import { PayoutItem, PayoutItemSchema } from './entities/payout-item.entity';
import { Settlement, SettlementSchema } from './entities/settlement.entity';
import {
  FinancialCoupon,
  FinancialCouponSchema,
} from './entities/financial-coupon.entity';
import {
  Reconciliation,
  ReconciliationSchema,
} from './entities/reconciliation.entity';
import { DailyReport, DailyReportSchema } from './entities/daily-report.entity';
import { Order, OrderSchema } from '../order/entities/order.entity';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from '../wallet/entities/wallet-transaction.entity';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: PayoutBatch.name, schema: PayoutBatchSchema },
      { name: PayoutItem.name, schema: PayoutItemSchema },
      { name: Settlement.name, schema: SettlementSchema },
      { name: FinancialCoupon.name, schema: FinancialCouponSchema },
      { name: Reconciliation.name, schema: ReconciliationSchema },
      { name: DailyReport.name, schema: DailyReportSchema },
      { name: Order.name, schema: OrderSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [FinanceController, SettlementController],
  providers: [
    CommissionService,
    PayoutService,
    SettlementService,
    CouponService,
    ReconciliationService,
    ReportsService,
  ],
  exports: [
    CommissionService,
    PayoutService,
    SettlementService,
    CouponService,
    ReconciliationService,
    ReportsService,
  ],
})
export class FinanceModule {}
