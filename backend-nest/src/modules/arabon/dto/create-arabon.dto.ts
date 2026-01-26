import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsISO8601 } from 'class-validator';

export enum ArabonStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
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
}
