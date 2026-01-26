import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'marketingevents' })
export class MarketingEvent extends Document {
  @Prop({ required: true })
  eventType: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop()
  source?: string;

  @Prop()
  medium?: string;

  @Prop()
  campaign?: string;

  @Prop()
  referrer?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MarketingEventSchema =
  SchemaFactory.createForClass(MarketingEvent);
MarketingEventSchema.index({ eventType: 1, createdAt: -1 });
MarketingEventSchema.index({ userId: 1, eventType: 1 });
