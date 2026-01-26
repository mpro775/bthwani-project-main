import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

@Schema({
  collection: 'withdrawals',
  timestamps: true,
})
export class Withdrawal {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['bank_transfer', 'wallet_transfer', 'crypto'],
    required: true
  })
  method: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: Object })
  bankDetails?: {
    accountNumber: string;
    routingNumber?: string;
    bankName: string;
    accountHolderName: string;
  };

  @Prop({ type: Object })
  cryptoDetails?: {
    address: string;
    network: string;
    currency: string;
  };

  @Prop({ type: Object })
  walletDetails?: {
    recipientId: string;
    recipientEmail?: string;
  };

  @Prop()
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedBy?: Types.ObjectId;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  transactionRef?: string;

  @Prop()
  notes?: string;

  @Prop()
  failureReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

// Create indexes
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });
WithdrawalSchema.index({ method: 1 });
WithdrawalSchema.index({ approvedAt: 1 });
WithdrawalSchema.index({ completedAt: 1 });
