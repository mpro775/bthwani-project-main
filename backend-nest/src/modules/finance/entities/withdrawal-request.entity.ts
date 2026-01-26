import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  iban?: string;
}

@Schema({ timestamps: true, collection: 'withdrawal_requests' })
export class WithdrawalRequest extends Document {
  @Prop({ type: Types.ObjectId, refPath: 'userModel', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Driver', 'Vendor', 'Marketer'],
    type: String,
  })
  userModel: string;

  @Prop({ required: true, min: 0, type: Number })
  amount: number;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'],
    default: 'pending',
    type: String,
  })
  status: string;

  @Prop({
    type: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      iban: String,
    },
    required: true,
  })
  bankDetails: BankDetails;

  @Prop({ type: String })
  transactionRef?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  rejectedBy?: Types.ObjectId;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Number, default: 0 })
  processingFee: number;

  @Prop({ type: String })
  receipt?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WithdrawalRequestSchema =
  SchemaFactory.createForClass(WithdrawalRequest);

// Indexes for performance
WithdrawalRequestSchema.index({ userId: 1, status: 1 });
WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ userModel: 1, status: 1 });
WithdrawalRequestSchema.index({ createdAt: -1 });

