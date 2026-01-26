import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class ProductAttributeValue {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Attribute' })
  attribute: Types.ObjectId;

  @Prop({ required: true })
  value: string;

  @Prop()
  displayValue?: string;
}

const ProductAttributeValueSchema = SchemaFactory.createForClass(
  ProductAttributeValue,
);

@Schema({ timestamps: true })
export class ProductCatalog extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'MerchantCategory', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  sellingUnits?: string[]; // ['kg', 'piece', 'box', etc.]

  @Prop({ type: [ProductAttributeValueSchema], default: [] })
  attributes?: ProductAttributeValue[];

  @Prop({
    required: true,
    enum: ['grocery', 'restaurant', 'retail'],
    default: 'grocery',
  })
  usageType: string;

  @Prop()
  barcode?: string; // باركود المنتج

  @Prop({ type: [String], default: [] })
  tags?: string[]; // للبحث

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ProductCatalogSchema =
  SchemaFactory.createForClass(ProductCatalog);

// Indexes
ProductCatalogSchema.index({ name: 1 });
ProductCatalogSchema.index({ category: 1 });
ProductCatalogSchema.index({ usageType: 1 });
ProductCatalogSchema.index({ barcode: 1 }, { unique: true, sparse: true });
ProductCatalogSchema.index({ tags: 1 });
ProductCatalogSchema.index({ isActive: 1 });
