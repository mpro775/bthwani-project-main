import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({
  collection: 'webhook_events',
  timestamps: true,
  expires: 'expiresAt' // TTL index for automatic cleanup
})
export class WebhookEvent {
  @Prop({ required: true, index: true })
  eventType: string;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ required: true, index: true })
  webhookId: string;

  @Prop({ default: Date.now })
  receivedAt: Date;

  @Prop({ default: false })
  processed: boolean;

  @Prop()
  processedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }) // 30 days
  expiresAt: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

// Create indexes
WebhookEventSchema.index({ eventType: 1, receivedAt: -1 });
WebhookEventSchema.index({ webhookId: 1, receivedAt: -1 });
WebhookEventSchema.index({ processed: 1, receivedAt: -1 });
WebhookEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
