import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsISO8601 } from 'class-validator';
import { ArabonStatus } from './create-arabon.dto';

export default class UpdateArabonDto {
  @ApiProperty({ description: 'عنوان العربون', required: false, example: 'عربون محدث' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'وصف إضافي', required: false, example: 'تفاصيل محدثة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'قيمة العربون', required: false, example: 300 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiProperty({ description: 'موعد التنفيذ/الجدولة', required: false, example: '2025-06-10T12:00:00.000Z', format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  scheduleAt?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { guests: 3 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العربون', required: false, enum: ArabonStatus, example: ArabonStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(ArabonStatus)
  status?: ArabonStatus;
}
