import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FinancialCoupon extends Document {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string; // كود الكوبون (SAVE10, FIRST50, etc.)

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: string;

  @Prop({ required: true })
  discountValue: number; // نسبة أو مبلغ ثابت

  @Prop()
  maxDiscountAmount?: number; // الحد الأقصى للخصم

  @Prop()
  minOrderAmount?: number; // الحد الأدنى لقيمة الطلب

  @Prop({ required: true })
  maxUsage: number; // الحد الأقصى لعدد الاستخدامات الكلي

  @Prop({ default: 0 })
  currentUsage: number; // عدد الاستخدامات الحالي

  @Prop({ default: 1 })
  maxUsagePerUser: number; // الحد الأقصى لكل مستخدم

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String] })
  allowedCities?: string[]; // المدن المسموحة

  @Prop({ type: [String], enum: ['app', 'web'] })
  allowedChannels?: string[]; // القنوات المسموحة

  @Prop({ enum: ['all', 'first_order', 'specific_category', 'specific_store'] })
  applicableTo?: string;

  @Prop()
  targetCategory?: string;

  @Prop()
  targetStore?: string;

  @Prop()
  createdByAdmin?: string; // معرف الأدمن الذي أنشأه

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FinancialCouponSchema =
  SchemaFactory.createForClass(FinancialCoupon);

// Indexes
FinancialCouponSchema.index({ code: 1 }, { unique: true });
FinancialCouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
FinancialCouponSchema.index({ currentUsage: 1, maxUsage: 1 });
