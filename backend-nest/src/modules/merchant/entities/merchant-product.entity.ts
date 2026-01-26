import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class MerchantProductAttribute {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Attribute' })
  attribute: Types.ObjectId;

  @Prop({ required: true })
  value: string;

  @Prop()
  displayValue?: string;
}

const MerchantProductAttributeSchema = SchemaFactory.createForClass(
  MerchantProductAttribute,
);

@Schema({ timestamps: true })
export class MerchantProduct extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Merchant' })
  merchant: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Store' })
  store: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductCatalog' })
  product: Types.ObjectId; // من الكتالوج

  @Prop({ required: true })
  price: number; // سعر البيع

  @Prop()
  originalPrice?: number; // السعر الأصلي (قبل الخصم)

  @Prop({ default: 0 })
  discountPercent?: number; // نسبة الخصم

  @Prop({ default: 0 })
  stock?: number; // المخزون

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop()
  customImage?: string; // صورة مخصصة للتاجر

  @Prop()
  customDescription?: string; // وصف مخصص

  @Prop({ type: Types.ObjectId, ref: 'StoreSection' })
  section?: Types.ObjectId;

  @Prop({
    enum: ['catalog', 'merchant', 'imported'],
    default: 'catalog',
  })
  origin?: string; // مصدر المنتج

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: 0 })
  rating?: number;

  @Prop({ default: 0 })
  ratingsCount?: number;

  @Prop()
  sellingUnit?: string; // وحدة البيع (kg, pcs, box)

  @Prop()
  unitSize?: number; // حجم الوحدة (1, 0.5, 250)

  @Prop()
  unitMeasure?: string; // القياس (kg, g, l, ml, pcs)

  @Prop({ default: 1 })
  minQtyPerOrder?: number; // الحد الأدنى للطلب

  @Prop({ default: 0 })
  maxQtyPerOrder?: number; // الحد الأقصى (0 = غير محدد)

  @Prop({ default: 1 })
  stepQty?: number; // الزيادة (1, 0.5, إلخ)

  @Prop({ default: 0 })
  avgPrepTimeMin?: number; // وقت التحضير بالدقائق

  @Prop({ type: [MerchantProductAttributeSchema], default: [] })
  customAttributes?: MerchantProductAttribute[];

  @Prop({ default: 0 })
  soldCount?: number; // عدد المبيعات

  @Prop({ type: Date })
  lastSoldAt?: Date; // آخر عملية بيع
}

export const MerchantProductSchema =
  SchemaFactory.createForClass(MerchantProduct);

// Compound Indexes
MerchantProductSchema.index({ merchant: 1, isAvailable: 1 });
MerchantProductSchema.index({ store: 1, isAvailable: 1 });
MerchantProductSchema.index({ store: 1, section: 1 });
MerchantProductSchema.index({ product: 1, store: 1 });
MerchantProductSchema.index({ origin: 1, store: 1 });
MerchantProductSchema.index({ price: 1 });
MerchantProductSchema.index({ rating: -1 });
MerchantProductSchema.index({ soldCount: -1 });
