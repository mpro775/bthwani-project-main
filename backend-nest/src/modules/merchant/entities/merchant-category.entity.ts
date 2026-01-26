import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MerchantCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  nameAr?: string; // الاسم بالعربية

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'MerchantCategory' })
  parent?: Types.ObjectId; // للفئات الفرعية

  @Prop({ default: 0 })
  level?: number; // مستوى التداخل (0 = جذر، 1 = فرع، إلخ)

  @Prop({ default: 0 })
  order?: number; // ترتيب العرض

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  icon?: string; // أيقونة الفئة

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: 0 })
  productsCount?: number; // عدد المنتجات في هذه الفئة
}

export const MerchantCategorySchema =
  SchemaFactory.createForClass(MerchantCategory);

// Indexes
MerchantCategorySchema.index({ name: 1 });
MerchantCategorySchema.index({ parent: 1 });
MerchantCategorySchema.index({ level: 1, order: 1 });
MerchantCategorySchema.index({ isActive: 1 });
