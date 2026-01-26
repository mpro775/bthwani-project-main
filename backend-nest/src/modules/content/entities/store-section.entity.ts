import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StoreSection extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Store' })
  store: Types.ObjectId;

  @Prop({ required: true })
  name: string; // اسم القسم (مشاوي، خضروات، عصائر، إلخ)

  @Prop()
  nameAr?: string; // الاسم بالعربية

  @Prop()
  description?: string;

  @Prop()
  icon?: string; // أيقونة القسم

  @Prop({
    required: true,
    enum: ['grocery', 'restaurant', 'retail'],
    default: 'grocery',
  })
  usageType: string;

  @Prop({ default: 0 })
  order: number; // ترتيب العرض

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  productsCount?: number; // عدد المنتجات في هذا القسم

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const StoreSectionSchema = SchemaFactory.createForClass(StoreSection);

// Indexes
StoreSectionSchema.index({ store: 1, order: 1 });
StoreSectionSchema.index({ store: 1, isActive: 1 });
StoreSectionSchema.index({ usageType: 1 });
