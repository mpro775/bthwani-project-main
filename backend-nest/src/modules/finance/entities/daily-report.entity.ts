import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DailyReport extends Document {
  @Prop({ required: true, unique: true })
  date: Date; // التاريخ (يوم واحد)

  @Prop({ required: true, unique: true })
  reportNumber: string; // رقم التقرير (DR-2025-10-14)

  // Orders Statistics
  @Prop({ type: Object })
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    totalValue: number;
    averageOrderValue: number;
  };

  // Revenue Breakdown
  @Prop({ type: Object })
  revenue: {
    totalGross: number;
    platformCommission: number;
    deliveryFees: number;
    tips: number;
    other: number;
    totalNet: number;
  };

  // Commissions
  @Prop({ type: Object })
  commissions: {
    drivers: { count: number; total: number };
    vendors: { count: number; total: number };
    marketers: { count: number; total: number };
    totalPaid: number;
    totalPending: number;
  };

  // Payouts
  @Prop({ type: Object })
  payouts: {
    batchesCreated: number;
    batchesCompleted: number;
    totalAmount: number;
    itemsCount: number;
  };

  // Settlements
  @Prop({ type: Object })
  settlements: {
    vendorSettlements: number;
    driverSettlements: number;
    totalAmount: number;
  };

  // Coupons Usage
  @Prop({ type: Object })
  coupons: {
    used: number;
    totalDiscount: number;
    mostUsedCode?: string;
    mostUsedCount?: number;
  };

  // User Activity
  @Prop({ type: Object })
  users: {
    newRegistrations: number;
    activeUsers: number;
    newOrders: number;
    returningCustomers: number;
  };

  // Wallet Activity
  @Prop({ type: Object })
  wallet: {
    deposits: number;
    withdrawals: number;
    totalBalance: number;
    transactions: number;
  };

  @Prop({
    required: true,
    enum: ['draft', 'finalized', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Date })
  finalizedAt?: Date;

  @Prop()
  generatedBy?: string; // system or admin ID

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DailyReportSchema = SchemaFactory.createForClass(DailyReport);

// Indexes
DailyReportSchema.index({ date: 1 }, { unique: true });
DailyReportSchema.index({ reportNumber: 1 }, { unique: true });
DailyReportSchema.index({ status: 1 });
DailyReportSchema.index({ createdAt: -1 });
