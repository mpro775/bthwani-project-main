import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'deliverysubcategories' })
export class DeliverySubCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  })
  store: Types.ObjectId;
}

export const DeliverySubCategorySchema =
  SchemaFactory.createForClass(DeliverySubCategory);

DeliverySubCategorySchema.index({ store: 1 });
