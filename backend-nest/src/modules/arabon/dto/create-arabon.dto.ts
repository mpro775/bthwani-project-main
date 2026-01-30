import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsISO8601, IsArray } from 'class-validator';

export enum ArabonStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ArabonBookingPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week'
}

export default class CreateArabonDto {
  @ApiProperty({ description: 'معرف صاحب العربون', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان العربون', example: 'عربون لحجز عرض سياحي' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'وصف إضافي', required: false, example: 'تفاصيل الحجز' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'قيمة العربون', required: false, example: 250.5 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiProperty({ description: 'موعد التنفيذ/الجدولة', required: false, example: '2025-06-01T10:00:00.000Z', format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  scheduleAt?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { guests: 2 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العربون', required: false, enum: ArabonStatus, default: ArabonStatus.DRAFT })
  @IsOptional()
  @IsEnum(ArabonStatus)
  status?: ArabonStatus;

  @ApiProperty({ description: 'روابط صور CDN (Bunny)', required: false, example: ['https://cdn.bthwani.com/arabon/1-img.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'رقم التواصل للحجز', required: false, example: '+967771234567' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({
    description: 'صفحات التواصل',
    required: false,
    example: { whatsapp: 'https://wa.me/967771234567', facebook: 'https://facebook.com/page', instagram: 'https://instagram.com/page' },
  })
  @IsOptional()
  @IsObject()
  socialLinks?: { whatsapp?: string; facebook?: string; instagram?: string };

  @ApiProperty({ description: 'نوع العقار (منشأة، شاليه، صالة، أخرى)', required: false, example: 'شاليه' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'قيمة الحجز الكاملة (ريال)', required: false, example: 1500 })
  @IsOptional()
  @IsNumber()
  bookingPrice?: number;

  @ApiProperty({ description: 'فترة الحجز', required: false, enum: ArabonBookingPeriod, example: ArabonBookingPeriod.DAY })
  @IsOptional()
  @IsEnum(ArabonBookingPeriod)
  bookingPeriod?: 'hour' | 'day' | 'week';

  @ApiProperty({ description: 'السعر لكل فترة (ريال)', required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  pricePerPeriod?: number;
}
