import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'terms_of_service' })
export class TermsOfService extends Document {
  @ApiProperty({ description: 'إصدار الشروط' })
  @Prop({ required: true, type: String })
  version: string;

  @ApiProperty({ description: 'محتوى الشروط بالعربية' })
  @Prop({ required: true, type: String })
  content: string;

  @ApiProperty({ description: 'محتوى الشروط بالإنجليزية' })
  @Prop({ required: true, type: String })
  contentEn: string;

  @ApiProperty({ description: 'تاريخ سريان الشروط' })
  @Prop({ type: Date, default: Date.now })
  effectiveDate: Date;

  @ApiProperty({ description: 'هل الشروط نشطة' })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;

  @ApiProperty({ description: 'تاريخ التحديث' })
  updatedAt: Date;
}

export const TermsOfServiceSchema =
  SchemaFactory.createForClass(TermsOfService);
