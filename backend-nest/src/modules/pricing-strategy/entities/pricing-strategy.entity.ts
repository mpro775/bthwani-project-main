import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PricingTier {
  @Prop({ required: true })
  minDistance: number;

  @Prop({ required: true })
  maxDistance: number;

  @Prop({ required: true })
  pricePerKm: number;
}

@Schema({ timestamps: true, collection: 'pricingstrategies' })
export class PricingStrategy extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  baseDistance: number;

  @Prop({ required: true, default: 0 })
  basePrice: number;

  @Prop({ type: [Object], default: [] })
  tiers: Array<{ minDistance: number; maxDistance: number; pricePerKm: number }>;

  @Prop({ required: true, default: 0 })
  defaultPricePerKm: number;

  @Prop({ default: false })
  isDefault?: boolean;
}

export const PricingStrategySchema =
  SchemaFactory.createForClass(PricingStrategy);

PricingStrategySchema.index({ isDefault: 1 });
