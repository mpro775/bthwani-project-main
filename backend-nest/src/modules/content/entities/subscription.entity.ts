import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SubscriptionPlan extends Document {
  @Prop({ required: true, unique: true })
  code: string; // PREMIUM, GOLD, BASIC, etc.

  @Prop({ required: true })
  name: string;

  @Prop()
  nameAr?: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number; // السعر الشهري

  @Prop({
    required: true,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  })
  billingCycle: string;

  @Prop({ type: [String], default: [] })
  features?: string[]; // الميزات

  @Prop({ default: 0 })
  discountPercent?: number; // خصم على الاشتراك

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order?: number; // ترتيب العرض

  @Prop({ default: 0 })
  subscribersCount?: number; // عدد المشتركين
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);

@Schema({ timestamps: true })
export class UserSubscription extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'SubscriptionPlan' })
  plan: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active',
  })
  status: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date; // تاريخ انتهاء الاشتراك

  @Prop({ default: true })
  autoRenew: boolean; // التجديد التلقائي

  @Prop()
  lastBillingDate?: Date; // آخر دفعة

  @Prop()
  nextBillingDate?: Date; // الدفعة القادمة

  @Prop({ default: 0 })
  amountPaid?: number; // المبلغ المدفوع

  @Prop()
  paymentMethod?: string; // طريقة الدفع

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);

// Indexes
SubscriptionPlanSchema.index({ code: 1 }, { unique: true });
SubscriptionPlanSchema.index({ isActive: 1, order: 1 });
UserSubscriptionSchema.index({ user: 1, status: 1 });
UserSubscriptionSchema.index({ status: 1, endDate: 1 });
UserSubscriptionSchema.index({ nextBillingDate: 1 });
