import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum SanadKind {
  SPECIALIST = 'specialist',
  EMERGENCY = 'emergency',
  CHARITY = 'charity'
}

export enum SanadStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateSanadDto {
  @ApiProperty({ description: 'معرف صاحب الطلب', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان الطلب', example: 'طلب فزعة لإسعاف عاجل' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل الطلب', required: false, example: 'حالة طبية تحتاج نقل عاجل' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع الطلب', required: false, enum: SanadKind, example: SanadKind.EMERGENCY })
  @IsOptional()
  @IsEnum(SanadKind)
  kind?: SanadKind;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { location: 'الرياض', contact: '+9665XXXXXXX' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الطلب', required: false, enum: SanadStatus, default: SanadStatus.DRAFT })
  @IsOptional()
  @IsEnum(SanadStatus)
  status?: SanadStatus;
}
