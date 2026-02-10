import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum, IsIn } from 'class-validator';

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const URGENCY_LEVELS = ['low', 'normal', 'urgent', 'critical'] as const;

export enum Es3afniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export default class CreateEs3afniDto {
  @ApiProperty({ description: 'معرف صاحب البلاغ', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان البلاغ', example: 'حاجة عاجلة لفصيلة O+ في الرياض' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل إضافية', required: false, example: 'المريض بحاجة عاجلة خلال 24 ساعة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'فصيلة الدم المطلوبة', required: false, example: 'O+', enum: BLOOD_TYPES })
  @IsOptional()
  @IsString()
  @IsIn(BLOOD_TYPES)
  bloodType?: string;

  @ApiProperty({ description: 'مستوى الأولوية', required: false, enum: URGENCY_LEVELS })
  @IsOptional()
  @IsString()
  @IsIn(URGENCY_LEVELS)
  urgency?: string;

  @ApiProperty({ description: 'موقع المستشفى/الجهة', required: false, example: { lat: 24.7136, lng: 46.6753, address: 'الرياض' } })
  @IsOptional()
  @IsObject()
  location?: any;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { contact: '+9665XXXXXXX', unitsNeeded: 3 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة البلاغ', required: false, enum: Es3afniStatus, default: Es3afniStatus.DRAFT })
  @IsOptional()
  @IsEnum(Es3afniStatus)
  status?: Es3afniStatus;
}
