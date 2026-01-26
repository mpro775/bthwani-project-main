import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookDeliveryDocument = WebhookDelivery & Document;

@Schema({
  collection: 'webhook_deliveries',
  timestamps: true,
})
export class WebhookDelivery {
  @Prop({ required: true, index: true })
  webhookId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ required: true })
  signature: string;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'delivered', 'failed'],
    default: 'pending'
  })
  status: string;

  @Prop({ default: 1 })
  attempts: number;

  @Prop()
  deliveredAt: Date;

  @Prop()
  processedAt?: Date;

  @Prop()
  responseCode?: number;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  responseHeaders?: Record<string, string>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const WebhookDeliverySchema = SchemaFactory.createForClass(WebhookDelivery);

// Create indexes
WebhookDeliverySchema.index({ webhookId: 1, status: 1 });
WebhookDeliverySchema.index({ eventType: 1 });
WebhookDeliverySchema.index({ deliveredAt: -1 });
WebhookDeliverySchema.index({ status: 1, deliveredAt: -1 });
