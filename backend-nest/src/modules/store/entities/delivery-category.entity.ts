import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'deliverycategories' })
export class DeliveryCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  icon?: string;

  @Prop({ default: '' })
  image?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryCategory', default: null })
  parent?: Types.ObjectId | null;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: String, enum: ['grocery', 'restaurant', 'retail', 'all'], default: 'all' })
  usageType: string;
}

export const DeliveryCategorySchema = SchemaFactory.createForClass(DeliveryCategory);
DeliveryCategorySchema.index({ parent: 1, sortOrder: 1 });
DeliveryCategorySchema.index({ isActive: 1 });
