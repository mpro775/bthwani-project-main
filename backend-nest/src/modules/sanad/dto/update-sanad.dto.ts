import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { SanadKind, SanadStatus } from './create-sanad.dto';

export default class UpdateSanadDto {
  @ApiProperty({ description: 'عنوان الطلب', required: false, example: 'طلب فزعة محدث' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'تفاصيل الطلب', required: false, example: 'تفاصيل محدثة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع الطلب', required: false, enum: SanadKind, example: SanadKind.SPECIALIST })
  @IsOptional()
  @IsEnum(SanadKind)
  kind?: SanadKind;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { location: 'الدمام' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الطلب', required: false, enum: SanadStatus, example: SanadStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(SanadStatus)
  status?: SanadStatus;
}
