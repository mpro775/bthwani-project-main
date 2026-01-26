import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification extends Document {
  @Prop({ index: true })
  toUser?: string;

  @Prop({ type: [String], default: [] })
  audience: string[];

  @Prop({ index: true })
  collapseId?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object })
  data?: any;

  @Prop({
    type: String,
    enum: ['queued', 'sent', 'delivered', 'failed'],
    default: 'queued',
  })
  status: string;

  @Prop({ type: [Object], default: [] })
  tickets: any[];

  @Prop({ type: [Object], default: [] })
  receipts: any[];

  @Prop()
  error?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ toUser: 1, createdAt: -1 });
NotificationSchema.index({ collapseId: 1 });
NotificationSchema.index({ status: 1 });
