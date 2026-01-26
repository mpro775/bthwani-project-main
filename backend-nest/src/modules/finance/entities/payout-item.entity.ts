import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayoutItem extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'PayoutBatch' })
  batchId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, refPath: 'recipientModel' })
  recipient: Types.ObjectId; // المستلم

  @Prop({ required: true, enum: ['Driver', 'Vendor', 'User', 'Marketer'] })
  recipientModel: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: ['pending', 'processed', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['commission', 'refund', 'withdrawal', 'other'],
  })
  type: string;

  @Prop()
  bankAccount?: string; // رقم الحساب البنكي

  @Prop()
  bankName?: string;

  @Prop()
  accountHolder?: string; // اسم صاحب الحساب

  @Prop()
  transactionId?: string; // معرف المعاملة من البنك

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PayoutItemSchema = SchemaFactory.createForClass(PayoutItem);

// Indexes
PayoutItemSchema.index({ batchId: 1 });
PayoutItemSchema.index({ recipient: 1, recipientModel: 1 });
PayoutItemSchema.index({ status: 1 });
PayoutItemSchema.index({ transactionId: 1 });
