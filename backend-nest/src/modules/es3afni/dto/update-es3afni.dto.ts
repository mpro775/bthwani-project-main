import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum, IsIn } from 'class-validator';
import { Es3afniStatus, BLOOD_TYPES, URGENCY_LEVELS } from './create-es3afni.dto';

export default class UpdateEs3afniDto {
  @ApiProperty({ description: 'عنوان البلاغ', required: false, example: 'نداء محدث لفصيلة O+' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'تفاصيل إضافية', required: false, example: 'تفاصيل محدثة للبلاغ' })
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

  @ApiProperty({ description: 'الموقع', required: false, example: { lat: 24.7, lng: 46.6, address: 'الرياض' } })
  @IsOptional()
  @IsObject()
  location?: any;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { contact: '+9665XXXXXXX', unitsNeeded: 2 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة البلاغ', required: false, enum: Es3afniStatus, example: Es3afniStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(Es3afniStatus)
  status?: Es3afniStatus;
}
