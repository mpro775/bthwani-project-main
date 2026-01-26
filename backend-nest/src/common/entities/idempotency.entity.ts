import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdempotencyRecordDocument = IdempotencyRecord & Document;

@Schema({
  collection: 'idempotency_records',
  timestamps: true,
  expires: 'expiresAt' // TTL index
})
export class IdempotencyRecord {
  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ type: Object })
  result?: any;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ index: true })
  processedAt?: Date;

  @Prop({ required: true, index: true })
  expiresAt: Date;
}

export const IdempotencyRecordSchema = SchemaFactory.createForClass(IdempotencyRecord);

// Create indexes
IdempotencyRecordSchema.index({ key: 1, endpoint: 1, method: 1, userId: 1 }, { unique: true });
IdempotencyRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
