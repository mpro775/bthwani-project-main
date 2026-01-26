import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'adspends' })
export class AdSpend extends Document {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  campaignName: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 0 })
  impressions: number;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  conversions: number;

  @Prop({ default: 'YER' })
  currency: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AdSpendSchema = SchemaFactory.createForClass(AdSpend);
AdSpendSchema.index({ date: -1, platform: 1, campaignName: 1 });
