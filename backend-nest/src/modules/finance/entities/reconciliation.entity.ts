import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reconciliation extends Document {
  @Prop({ required: true, unique: true })
  reconciliationNumber: string; // رقم المطابقة (RC-2025-001)

  @Prop({ required: true })
  period: Date; // الفترة (شهر/أسبوع/يوم)

  @Prop({
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'daily',
  })
  periodType: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    required: true,
    enum: [
      'pending',
      'in_progress',
      'completed',
      'failed',
      'requires_attention',
    ],
    default: 'pending',
  })
  status: string;

  // الإجماليات المتوقعة من النظام
  @Prop({ type: Object })
  systemTotals: {
    totalOrders: number;
    totalRevenue: number;
    totalCommissions: number;
    totalPayouts: number;
    totalRefunds: number;
  };

  // الإجماليات الفعلية (من البنك/المصادر الخارجية)
  @Prop({ type: Object })
  actualTotals?: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalFees: number;
  };

  // الفروقات
  @Prop({ type: Object })
  discrepancies?: {
    revenueDifference: number;
    commissionDifference: number;
    payoutDifference: number;
    unexplainedTransactions: number;
  };

  @Prop({ type: [Object] })
  issues?: Array<{
    type: 'missing_transaction' | 'amount_mismatch' | 'duplicate' | 'other';
    description: string;
    expectedAmount?: number;
    actualAmount?: number;
    transactionRef?: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId;
    resolution?: string;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  performedBy?: Types.ObjectId;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ReconciliationSchema =
  SchemaFactory.createForClass(Reconciliation);

// Indexes
ReconciliationSchema.index({ reconciliationNumber: 1 }, { unique: true });
ReconciliationSchema.index({ period: 1 });
ReconciliationSchema.index({ status: 1, createdAt: -1 });
ReconciliationSchema.index({ startDate: 1, endDate: 1 });
