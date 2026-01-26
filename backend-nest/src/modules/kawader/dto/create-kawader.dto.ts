import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum } from 'class-validator';

export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateKawaderDto {
  @ApiProperty({ description: 'معرف صاحب العرض', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان العرض الوظيفي', example: 'مطور Full Stack مطلوب لمشروع تقني' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل العرض', required: false, example: 'نحتاج مطور بخبرة 3+ سنوات في React و Node.js' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نطاق العمل', required: false, example: 'مشروع 6 أشهر' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiProperty({ description: 'الميزانية المتاحة', required: false, example: 15000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { experience: '3+ years', skills: ['React', 'Node.js'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العرض', required: false, enum: KawaderStatus, default: KawaderStatus.DRAFT })
  @IsOptional()
  @IsEnum(KawaderStatus)
  status?: KawaderStatus;
}
