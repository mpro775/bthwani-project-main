import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Attribute extends Document {
  @Prop({ required: true, unique: true })
  name: string; // Brand, Color, Size, etc.

  @Prop()
  nameAr?: string; // الاسم بالعربية

  @Prop({
    required: true,
    enum: ['text', 'number', 'select', 'multiselect', 'color', 'boolean'],
    default: 'text',
  })
  type: string;

  @Prop({ type: [String], default: [] })
  options?: string[]; // للـ select/multiselect

  @Prop()
  unit?: string; // الوحدة (kg, cm, ml, etc.)

  @Prop({ default: false })
  required?: boolean; // هل الخاصية إلزامية

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order?: number; // ترتيب العرض

  @Prop()
  description?: string;

  @Prop()
  placeholder?: string; // نص توضيحي

  @Prop({ type: Object })
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);

// Indexes
AttributeSchema.index({ name: 1 }, { unique: true });
AttributeSchema.index({ isActive: 1 });
AttributeSchema.index({ order: 1 });
