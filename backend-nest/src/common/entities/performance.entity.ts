import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PerformanceMetricDocument = PerformanceMetric & Document;
export type PerformanceBudgetDocument = PerformanceBudget & Document;

@Schema({
  collection: 'performance_metrics',
  timestamps: false,
  expires: 'expiresAt' // TTL index for automatic cleanup
})
export class PerformanceMetric {
  @Prop({ required: true, index: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  responseTime: number; // milliseconds

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }) // 30 days
  expiresAt: Date;
}

@Schema({
  collection: 'performance_budgets',
  timestamps: true,
})
export class PerformanceBudget {
  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true, default: 2500 })
  lcpThreshold: number; // Largest Contentful Paint (ms)

  @Prop({ required: true, default: 200 })
  inpThreshold: number; // Interaction to Next Paint (ms)

  @Prop({ required: true, default: 1000 })
  responseTimeThreshold: number; // General response time (ms)

  @Prop({ required: true, default: 1 })
  errorRateThreshold: number; // Max error rate (%)

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PerformanceMetricSchema = SchemaFactory.createForClass(PerformanceMetric);
export const PerformanceBudgetSchema = SchemaFactory.createForClass(PerformanceBudget);

// Create indexes
PerformanceMetricSchema.index({ endpoint: 1, method: 1, timestamp: -1 });
PerformanceMetricSchema.index({ statusCode: 1 });
PerformanceMetricSchema.index({ responseTime: 1 });
PerformanceMetricSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

PerformanceBudgetSchema.index({ endpoint: 1, method: 1 }, { unique: true });
