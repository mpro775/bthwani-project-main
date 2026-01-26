import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'roasdaily' })
export class RoasDaily extends Document {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  platform: string;

  @Prop({ default: 0 })
  adSpend: number;

  @Prop({ default: 0 })
  revenue: number;

  @Prop({ default: 0 })
  roas: number;

  @Prop({ default: 0 })
  orders: number;

  @Prop({ default: 0 })
  conversions: number;

  @Prop({ default: 0 })
  impressions: number;

  @Prop({ default: 0 })
  clicks: number;
}

export const RoasDailySchema = SchemaFactory.createForClass(RoasDaily);
RoasDailySchema.index({ date: -1, platform: 1 });
