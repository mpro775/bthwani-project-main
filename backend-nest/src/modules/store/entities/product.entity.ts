import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'deliveryproducts' })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  name_ar?: string;

  @Prop()
  name_en?: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'DeliveryStore',
    required: true,
    index: true,
  })
  store: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryCategory', index: true })
  category?: Types.ObjectId;

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ default: 0 })
  stockQuantity: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  finalPrice?: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingsCount: number;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  sku?: string;

  @Prop()
  barcode?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ name: 'text', name_ar: 'text', name_en: 'text' });
ProductSchema.index({ store: 1, isActive: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1 });
