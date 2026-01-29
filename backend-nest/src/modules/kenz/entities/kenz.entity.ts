import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Kenz extends Document {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'السعر', required: false, example: 3500 })
  @Prop()
  price?: number;

  @ApiProperty({ description: 'الفئة', required: false, example: 'إلكترونيات' })
  @Prop()
  category?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'فضي', storage: '256GB' } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', enum: KenzStatus, default: KenzStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: KenzStatus;

  @ApiProperty({ description: 'روابط صور CDN (Bunny)', required: false, example: ['https://cdn.bthwani.com/kenz/1-img.jpg'] })
  @Prop({ type: [String], default: [] })
  images: string[];

  @ApiProperty({ description: 'المدينة (من الـ 22 محافظة يمنية)', required: false, example: 'صنعاء' })
  @Prop()
  city?: string;

  @ApiProperty({ description: 'عدد المشاهدات', default: 0 })
  @Prop({ default: 0 })
  viewCount: number;

  @ApiProperty({ description: 'كلمات مفتاحية', required: false, example: ['جوال', 'أيفون'] })
  @Prop({ type: [String], default: [] })
  keywords: string[];

  @ApiProperty({ description: 'العملة', required: false, example: 'ريال يمني', default: 'ريال يمني' })
  @Prop({ default: 'ريال يمني' })
  currency?: string;

  @ApiProperty({ description: 'الكمية', required: false, example: 1, default: 1 })
  @Prop({ default: 1 })
  quantity?: number;
}

export const KenzSchema = SchemaFactory.createForClass(Kenz);
