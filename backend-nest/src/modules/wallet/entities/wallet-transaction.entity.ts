import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'wallettransactions' })
export class WalletTransaction extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['User', 'Driver'], index: true })
  userModel: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, enum: ['credit', 'debit'], required: true })
  type: string;

  @Prop({
    type: String,
    enum: [
      'agent',
      'card',
      'transfer',
      'payment',
      'escrow',
      'reward',
      'kuraimi',
      'withdrawal',
    ],
    default: 'kuraimi',
  })
  method: string;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed',
  })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  transactions?: string;

  @Prop({ unique: true, sparse: true })
  bankRef?: string;

  @Prop({ type: Object })
  meta?: any;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

// ==================== Indexes - محسّنة للأداء ====================

// Basic Indexes (من المشروع القديم)
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ bankRef: 1 }, { unique: true, sparse: true });
WalletTransactionSchema.index(
  { userId: 1, 'meta.orderId': 1, method: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { method: 'escrow', status: 'pending' },
  },
);

// ⚡ Performance Indexes (جديدة)
WalletTransactionSchema.index({ type: 1, status: 1, createdAt: -1 }); // للتقارير المالية
WalletTransactionSchema.index({ method: 1, status: 1 }); // تحليلات طرق الدفع
WalletTransactionSchema.index({ userId: 1, type: 1, status: 1 }); // معاملات المستخدم
WalletTransactionSchema.index({ status: 1, createdAt: -1 }); // المعاملات المعلقة
WalletTransactionSchema.index({ userModel: 1, userId: 1 }); // للبحث السريع
WalletTransactionSchema.index({ amount: -1 }, { sparse: true }); // للمعاملات الكبيرة
