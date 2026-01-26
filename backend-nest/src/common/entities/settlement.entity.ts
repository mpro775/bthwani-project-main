import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettlementRecordDocument = SettlementRecord & Document;

@Schema({
  collection: 'settlement_records',
  timestamps: true,
})
export class SettlementRecord {
  @Prop({ required: true, unique: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  totalTransactions: number;

  @Prop({ default: 0 })
  totalVolume: number;

  @Prop({ default: 0 })
  successfulTransactions: number;

  @Prop({ default: 0 })
  failedTransactions: number;

  @Prop({ default: 0 })
  settlementAmount: number;

  @Prop({ default: 0 })
  fees: number;

  @Prop({ default: 0 })
  netAmount: number;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status: string;

  @Prop()
  processedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SettlementRecordSchema = SchemaFactory.createForClass(SettlementRecord);

// Create indexes
SettlementRecordSchema.index({ date: 1 }, { unique: true });
SettlementRecordSchema.index({ status: 1 });
SettlementRecordSchema.index({ processedAt: 1 });
