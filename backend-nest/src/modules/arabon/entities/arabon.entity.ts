import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum ArabonStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Arabon extends Document {
  @ApiProperty({
    description: 'معرف صاحب العربون',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({
    description: 'عنوان العربون',
    example: 'عربون لحجز عرض سياحي',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'وصف إضافي',
    required: false,
    example: 'تفاصيل الحجز',
  })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'قيمة العربون', required: false, example: 250.5 })
  @Prop()
  depositAmount?: number;

  @ApiProperty({
    description: 'موعد التنفيذ/الجدولة',
    required: false,
    example: '2025-06-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @Prop()
  scheduleAt?: Date;

  @ApiProperty({
    description: 'بيانات إضافية',
    required: false,
    example: { guests: 2 },
  })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'حالة العربون',
    enum: ArabonStatus,
    default: ArabonStatus.DRAFT,
  })
  @Prop({ default: 'draft' })
  status: ArabonStatus;

  @ApiProperty({
    description: 'روابط صور CDN (Bunny)',
    required: false,
    example: ['https://cdn.bthwani.com/arabon/1-img.jpg'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  images: string[];

  @ApiProperty({
    description: 'روابط فيديو للمكان (اختياري)',
    required: false,
    example: ['https://cdn.bthwani.com/arabon/1-video.mp4'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  videos: string[];

  @ApiProperty({
    description: 'رقم التواصل للحجز',
    required: false,
    example: '+967771234567',
  })
  @Prop()
  contactPhone?: string;

  @ApiProperty({
    description: 'صفحات التواصل',
    required: false,
    example: { whatsapp: 'https://wa.me/967771234567', facebook: 'https://facebook.com/page', instagram: 'https://instagram.com/page' },
  })
  @Prop({ type: Object })
  socialLinks?: { whatsapp?: string; facebook?: string; instagram?: string };

  @ApiProperty({
    description: 'نوع العقار: منشأة، شاليه، صالة، أخرى',
    required: false,
    example: 'شاليه',
  })
  @Prop()
  category?: string;

  @ApiProperty({
    description: 'فئة العرض: عيادة، صالون، فعالية، منشأة، أخرى',
    required: false,
    example: 'صالون',
    enum: ['clinic', 'salon', 'event', 'venue', 'other'],
  })
  @Prop({ enum: ['clinic', 'salon', 'event', 'venue', 'other'] })
  offerType?: 'clinic' | 'salon' | 'event' | 'venue' | 'other';

  @ApiProperty({
    description: 'قيمة الحجز الكاملة (ريال)',
    required: false,
    example: 1500,
  })
  @Prop()
  bookingPrice?: number;

  @ApiProperty({
    description: 'فترة الحجز: ساعة، يوم، أسبوع',
    required: false,
    example: 'day',
    enum: ['hour', 'day', 'week'],
  })
  @Prop({ default: 'day' })
  bookingPeriod?: 'hour' | 'day' | 'week';

  @ApiProperty({
    description: 'السعر لكل فترة (مثلاً 500 ريال/يوم)',
    required: false,
    example: 500,
  })
  @Prop()
  pricePerPeriod?: number;
}

export const ArabonSchema = SchemaFactory.createForClass(Arabon);
