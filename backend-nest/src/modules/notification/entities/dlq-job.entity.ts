import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DLQJobDocument = DLQJob & Document;

@Schema({
  collection: 'dlq_jobs',
  timestamps: true,
})
export class DLQJob {
  @Prop({ required: true, index: true })
  originalQueue: string;

  @Prop({ required: true, index: true })
  jobId: string;

  @Prop({ type: Object, required: true })
  jobData: any;

  @Prop({ required: true })
  failedReason: string;

  @Prop({ required: true, default: Date.now, index: true })
  failedAt: Date;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({
    type: String,
    enum: ['pending', 'retried', 'cleaned'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop()
  retriedAt?: Date;

  @Prop()
  cleanedAt?: Date;
}

export const DLQJobSchema = SchemaFactory.createForClass(DLQJob);

// Indexes for better query performance
DLQJobSchema.index({ originalQueue: 1, failedAt: -1 });
DLQJobSchema.index({ status: 1, failedAt: 1 });
