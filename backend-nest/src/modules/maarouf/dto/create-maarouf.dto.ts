import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsIn } from 'class-validator';

export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found'
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateMaaroufDto {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'محفظة سوداء مفقودة في منطقة النرجس' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع الإعلان', required: false, enum: MaaroufKind, example: MaaroufKind.LOST })
  @IsOptional()
  @IsEnum(MaaroufKind)
  kind?: MaaroufKind;

  @ApiProperty({ description: 'العلامات', required: false, type: [String], example: ['محفظة', 'بطاقات', 'نرجس'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: MaaroufStatus, default: MaaroufStatus.DRAFT })
  @IsOptional()
  @IsEnum(MaaroufStatus)
  status?: MaaroufStatus;
}
