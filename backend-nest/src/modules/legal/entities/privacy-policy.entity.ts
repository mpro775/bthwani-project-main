import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'privacy_policies' })
export class PrivacyPolicy extends Document {
  @ApiProperty({ description: 'إصدار السياسة' })
  @Prop({ required: true, type: String })
  version: string;

  @ApiProperty({ description: 'محتوى السياسة بالعربية' })
  @Prop({ required: true, type: String })
  content: string;

  @ApiProperty({ description: 'محتوى السياسة بالإنجليزية' })
  @Prop({ required: true, type: String })
  contentEn: string;

  @ApiProperty({ description: 'تاريخ سريان السياسة' })
  @Prop({ type: Date, default: Date.now })
  effectiveDate: Date;

  @ApiProperty({ description: 'هل السياسة نشطة' })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;

  @ApiProperty({ description: 'تاريخ التحديث' })
  updatedAt: Date;
}

export const PrivacyPolicySchema = SchemaFactory.createForClass(PrivacyPolicy);
