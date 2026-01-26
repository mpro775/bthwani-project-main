import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayoutBatch extends Document {
  @Prop({ required: true, unique: true })
  batchNumber: string; // رقم الدفعة (مثلاً: PB-2025-001)

  @Prop({ required: true })
  totalAmount: number; // إجمالي المبلغ

  @Prop({ required: true })
  itemsCount: number; // عدد العناصر في الدفعة

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ required: true, enum: ['bank_transfer', 'wallet', 'cash', 'check'] })
  paymentMethod: string;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date })
  scheduledFor?: Date; // موعد الدفع المجدول

  @Prop()
  bankReference?: string; // مرجع البنك

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PayoutBatchSchema = SchemaFactory.createForClass(PayoutBatch);

// Indexes
PayoutBatchSchema.index({ batchNumber: 1 }, { unique: true });
PayoutBatchSchema.index({ status: 1, createdAt: -1 });
PayoutBatchSchema.index({ scheduledFor: 1 });
