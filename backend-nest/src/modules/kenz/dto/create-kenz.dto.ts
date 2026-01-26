import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum } from 'class-validator';

export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateKenzDto {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'السعر', required: false, example: 3500 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'الفئة', required: false, example: 'إلكترونيات' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'فضي', storage: '256GB' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: KenzStatus, default: KenzStatus.DRAFT })
  @IsOptional()
  @IsEnum(KenzStatus)
  status?: KenzStatus;
}
