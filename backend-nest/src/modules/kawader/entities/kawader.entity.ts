import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Kawader extends Document {
  @ApiProperty({ description: 'معرف صاحب العرض', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان العرض الوظيفي', example: 'مطور Full Stack مطلوب لمشروع تقني' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل العرض', required: false, example: 'نحتاج مطور بخبرة 3+ سنوات في React و Node.js' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'نطاق العمل', required: false, example: 'مشروع 6 أشهر' })
  @Prop()
  scope?: string;

  @ApiProperty({ description: 'الميزانية المتاحة', required: false, example: 15000 })
  @Prop()
  budget?: number;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { experience: '3+ years', skills: ['React', 'Node.js'] } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة العرض', enum: KawaderStatus, default: KawaderStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: KawaderStatus;
}

export const KawaderSchema = SchemaFactory.createForClass(Kawader);
