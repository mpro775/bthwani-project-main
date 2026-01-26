import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum Es3afniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
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

  @ApiProperty({ description: 'فصيلة الدم المطلوبة', required: false, example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

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
