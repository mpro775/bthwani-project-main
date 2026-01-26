import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum WalletEventType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  HOLD = 'HOLD',
  RELEASE = 'RELEASE',
  REFUND = 'REFUND',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TOPUP = 'TOPUP',
  BILL_PAYMENT = 'BILL_PAYMENT',
  COMMISSION = 'COMMISSION',
}

export interface WalletEventMetadata {
  transactionId?: string;
  orderId?: string;
  fromUserId?: string;
  toUserId?: string;
  method?: string;
  description?: string;
  previousBalance?: number;
  newBalance?: number;
  currency?: string;
  source?: string;
  [key: string]: any;
}

@Schema({ timestamps: true, collection: 'wallet_events' })
export class WalletEvent extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: WalletEventType, index: true })
  eventType: WalletEventType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;

  @Prop({ type: Object, default: {} })
  metadata: WalletEventMetadata;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: String, required: true, index: true })
  aggregateId: string; // userId + sequence

  @Prop({ required: true, index: true })
  sequence: number; // رقم تسلسلي للأحداث

  @Prop({ type: String })
  correlationId?: string; // لربط الأحداث المرتبطة

  @Prop({ type: String })
  causationId?: string; // الحدث الذي سبب هذا الحدث

  @Prop({ default: false })
  isReplayed: boolean; // هل تم إعادة تشغيل هذا الحدث

  @Prop({ type: Date })
  replayedAt?: Date;
}

export const WalletEventSchema = SchemaFactory.createForClass(WalletEvent);

// Indexes for better performance
WalletEventSchema.index({ userId: 1, sequence: 1 });
WalletEventSchema.index({ aggregateId: 1, sequence: 1 }, { unique: true });
WalletEventSchema.index({ timestamp: 1 });
WalletEventSchema.index({ eventType: 1, timestamp: -1 });
WalletEventSchema.index({ correlationId: 1 });
