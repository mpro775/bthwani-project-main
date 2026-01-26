import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class GasConfig {
  @Prop({ default: false })
  enabled: boolean;

  @Prop({ default: 20 })
  cylinderSizeLiters: number; // حجم الأسطوانة (لتر)

  @Prop({ required: true })
  pricePerCylinder: number; // سعر الأسطوانة

  @Prop({ default: 1 })
  minQty: number; // الحد الأدنى للكمية

  @Prop({ type: Object })
  deliveryOverride?: {
    policy: 'flat' | 'strategy'; // ثابت أو حسب الاستراتيجية
    flatFee?: number;
  };
}

export class WaterSize {
  @Prop({ required: true, enum: ['small', 'medium', 'large'] })
  key: string;

  @Prop({ required: true })
  capacityLiters: number; // سعة الوايت

  @Prop({ required: true })
  pricePerTanker: number; // سعر الوايت الكامل
}

export class WaterConfig {
  @Prop({ default: false })
  enabled: boolean;

  @Prop({ type: [WaterSize], default: [] })
  sizes: WaterSize[];

  @Prop({ default: true })
  allowHalf: boolean; // السماح بنصف وايت

  @Prop({
    enum: ['linear', 'multiplier', 'fixed'],
    default: 'multiplier',
  })
  halfPricingPolicy: string;

  @Prop({ default: 0.5 })
  halfLinearFactor?: number; // 0.5 = نصف السعر

  @Prop({ default: 0.6 })
  halfMultiplier?: number; // 0.6 = 60% من السعر

  @Prop({ default: 0 })
  halfFixedAmount?: number; // مبلغ ثابت لنصف الوايت

  @Prop({ type: Object })
  deliveryOverride?: {
    policy: 'flat' | 'strategy';
    flatFee?: number;
  };
}

export class UtilityOrigin {
  @Prop()
  label?: string; // اسم الموقع

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}

@Schema({ timestamps: true })
export class UtilityPricing extends Document {
  @Prop({ required: true, unique: true })
  city: string; // صنعاء، عدن، إلخ

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  origins?: {
    gas?: UtilityOrigin;
    water?: UtilityOrigin;
  };

  @Prop({ type: GasConfig })
  gas?: GasConfig;

  @Prop({ type: WaterConfig })
  water?: WaterConfig;
}

export const UtilityPricingSchema =
  SchemaFactory.createForClass(UtilityPricing);

// Indexes
UtilityPricingSchema.index({ city: 1 }, { unique: true });
UtilityPricingSchema.index({ isActive: 1 });
