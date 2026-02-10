import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum } from 'class-validator';

export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
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

export default class CreateKawaderDto {
  @ApiProperty({ description: 'معرف صاحب العرض', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'نوع العرض: وظيفة أو خدمة', required: false, enum: KawaderOfferType, default: KawaderOfferType.JOB })
  @IsOptional()
  @IsEnum(KawaderOfferType)
  offerType?: KawaderOfferType;

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

  @ApiProperty({ description: 'نوع الوظيفة: دوام كامل، جزئي، عن بُعد', required: false, enum: KawaderJobType })
  @IsOptional()
  @IsEnum(KawaderJobType)
  jobType?: KawaderJobType;

  @ApiProperty({ description: 'الموقع أو المدينة', required: false, example: 'صنعاء' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'الراتب (للإعلانات الوظيفية)', required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: 'بيانات إضافية (experience, skills[], remote)', required: false, example: { experience: '3+ years', skills: ['React', 'Node.js'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العرض', required: false, enum: KawaderStatus, default: KawaderStatus.DRAFT })
  @IsOptional()
  @IsEnum(KawaderStatus)
  status?: KawaderStatus;
}
