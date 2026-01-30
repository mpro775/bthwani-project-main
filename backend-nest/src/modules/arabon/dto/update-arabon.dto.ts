import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsISO8601, IsArray } from 'class-validator';
import { ArabonStatus, ArabonBookingPeriod } from './create-arabon.dto';

export default class UpdateArabonDto {
  @ApiProperty({ description: 'عنوان العربون', required: false, example: 'عربون محدث' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'وصف إضافي', required: false, example: 'تفاصيل محدثة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'قيمة العربون', required: false, example: 300 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiProperty({ description: 'موعد التنفيذ/الجدولة', required: false, example: '2025-06-10T12:00:00.000Z', format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  scheduleAt?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { guests: 3 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العربون', required: false, enum: ArabonStatus, example: ArabonStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(ArabonStatus)
  status?: ArabonStatus;

  @ApiProperty({ description: 'روابط صور CDN (Bunny)', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'رقم التواصل للحجز', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'صفحات التواصل', required: false })
  @IsOptional()
  @IsObject()
  socialLinks?: { whatsapp?: string; facebook?: string; instagram?: string };

  @ApiProperty({ description: 'نوع العقار', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'قيمة الحجز الكاملة (ريال)', required: false })
  @IsOptional()
  @IsNumber()
  bookingPrice?: number;

  @ApiProperty({ description: 'فترة الحجز', required: false, enum: ArabonBookingPeriod })
  @IsOptional()
  @IsEnum(ArabonBookingPeriod)
  bookingPeriod?: 'hour' | 'day' | 'week';

  @ApiProperty({ description: 'السعر لكل فترة (ريال)', required: false })
  @IsOptional()
  @IsNumber()
  pricePerPeriod?: number;
}
