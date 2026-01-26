import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PromotionTarget {
  PRODUCT = 'product',
  STORE = 'store',
  CATEGORY = 'category',
}

export enum PromotionValueType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PromotionPlacement {
  HOME_HERO = 'home_hero', // سلايدر رئيسي
  HOME_STRIP = 'home_strip', // شريط في الرئيسية
  CATEGORY_HEADER = 'category_header', // أعلى صفحة الفئة
  CATEGORY_FEED = 'category_feed', // وسط صفحة الفئة
  STORE_HEADER = 'store_header', // أعلى صفحة المتجر
  SEARCH_BANNER = 'search_banner', // صفحة البحث
  CART = 'cart', // شاشة السلة
  CHECKOUT = 'checkout', // شاشة الدفع
}

export enum StackingRule {
  NONE = 'none', // لا يمكن دمجها مع عروض أخرى
  BEST = 'best', // اختيار الأفضل
  STACK_SAME_TARGET = 'stack_same_target', // دمج لنفس الهدف
}

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string; // رابط الصورة

  @Prop()
  link?: string; // deep-link أو رابط خارجي

  @Prop({
    required: true,
    enum: Object.values(PromotionTarget),
  })
  target: PromotionTarget;

  @Prop()
  value?: number; // قيمة الخصم (نسبة أو مبلغ)

  @Prop({
    enum: Object.values(PromotionValueType),
  })
  valueType?: PromotionValueType;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store' })
  store?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category?: Types.ObjectId;

  // تحكم العرض
  @Prop({
    type: [String],
    enum: Object.values(PromotionPlacement),
    default: [PromotionPlacement.HOME_HERO],
  })
  placements: PromotionPlacement[];

  @Prop({ type: [String], default: [] })
  cities?: string[]; // المدن المسموحة (فارغة = كل المدن)

  @Prop({
    type: [String],
    enum: ['app', 'web'],
    default: ['app'],
  })
  channels?: string[]; // القنوات المسموحة

  // قواعد الاحتساب
  @Prop({
    enum: Object.values(StackingRule),
    default: StackingRule.BEST,
  })
  stacking?: StackingRule;

  @Prop({ min: 1 })
  minQty?: number; // حد أدنى لكمية المنتج

  @Prop({ min: 0 })
  minOrderSubtotal?: number; // حد أدنى لقيمة الطلب

  @Prop({ min: 0 })
  maxDiscountAmount?: number; // سقف الخصم

  @Prop({ default: 0 })
  order?: number; // ترتيب العرض (للعرض)

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  viewsCount?: number; // عدد المشاهدات

  @Prop({ default: 0 })
  clicksCount?: number; // عدد النقرات

  @Prop({ default: 0 })
  conversionsCount?: number; // عدد التحويلات (طلبات)

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

// Indexes
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ target: 1, product: 1, store: 1, category: 1 });
PromotionSchema.index({ placements: 1, order: 1 });
PromotionSchema.index({ cities: 1 });
PromotionSchema.index({ channels: 1 });
