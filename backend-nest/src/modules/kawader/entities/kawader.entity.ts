import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/** نوع العرض: إعلان وظيفة أو عرض خدمة */
export enum KawaderOfferType {
  JOB = 'job',
  SERVICE = 'service',
}

/** نوع الوظيفة: دوام كامل، جزئي، عن بُعد */
export enum KawaderJobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  REMOTE = 'remote',
}

@Schema({ timestamps: true })
export class Kawader extends Document {
  @ApiProperty({
    description: 'معرف صاحب العرض',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({
    description: 'نوع العرض: وظيفة أو خدمة',
    enum: KawaderOfferType,
    default: KawaderOfferType.JOB,
  })
  @Prop({ type: String, enum: KawaderOfferType, default: KawaderOfferType.JOB })
  offerType?: KawaderOfferType;

  @ApiProperty({
    description: 'عنوان العرض الوظيفي',
    example: 'مطور Full Stack مطلوب لمشروع تقني',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'تفاصيل العرض',
    required: false,
    example: 'نحتاج مطور بخبرة 3+ سنوات في React و Node.js',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'نطاق العمل',
    required: false,
    example: 'مشروع 6 أشهر',
  })
  @Prop()
  scope?: string;

  @ApiProperty({
    description: 'الميزانية المتاحة',
    required: false,
    example: 15000,
  })
  @Prop()
  budget?: number;

  @ApiProperty({
    description: 'نوع الوظيفة (للإعلانات الوظيفية): دوام كامل، جزئي، عن بُعد',
    required: false,
    enum: KawaderJobType,
  })
  @Prop({ type: String, enum: KawaderJobType, default: null })
  jobType?: KawaderJobType | null;

  @ApiProperty({
    description: 'الموقع أو المدينة',
    required: false,
    example: 'صنعاء',
  })
  @Prop()
  location?: string;

  @ApiProperty({
    description: 'الراتب (للإعلانات الوظيفية)',
    required: false,
    example: 50000,
  })
  @Prop()
  salary?: number;

  @ApiProperty({
    description: 'بيانات إضافية (مثل experience, skills[], remote)',
    required: false,
    example: { experience: '3+ years', skills: ['React', 'Node.js'] },
  })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'حالة العرض',
    enum: KawaderStatus,
    default: KawaderStatus.DRAFT,
  })
  @Prop({ default: 'draft' })
  status: KawaderStatus;
}

export const KawaderSchema = SchemaFactory.createForClass(Kawader);
