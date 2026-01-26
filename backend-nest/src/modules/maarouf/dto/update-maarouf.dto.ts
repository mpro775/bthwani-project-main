import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsObject, IsEnum } from 'class-validator';
import { MaaroufKind, MaaroufStatus } from './create-maarouf.dto';

export default class UpdateMaaroufDto {
  @ApiProperty({ description: 'عنوان الإعلان', required: false, example: 'محفظة سوداء محدثة' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'تفاصيل محدثة للمحفظة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع الإعلان', required: false, enum: MaaroufKind, example: MaaroufKind.FOUND })
  @IsOptional()
  @IsEnum(MaaroufKind)
  kind?: MaaroufKind;

  @ApiProperty({ description: 'العلامات', required: false, type: [String], example: ['محفظة', 'أسود', 'موجودة'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'أسود', location: 'الروضة', date: '2024-01-16' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: MaaroufStatus, example: MaaroufStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(MaaroufStatus)
  status?: MaaroufStatus;
}
