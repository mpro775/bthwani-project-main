import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AmaniStatus } from '../entities/amani.entity';

export default class UpdateAmaniStatusDto {
  @ApiProperty({
    description: 'الحالة الجديدة للطلب',
    enum: AmaniStatus,
    example: AmaniStatus.IN_PROGRESS
  })
  @IsEnum(AmaniStatus)
  status: AmaniStatus;

  @ApiProperty({
    description: 'ملاحظة حول تغيير الحالة',
    example: 'بدأ السائق الرحلة',
    required: false,
    type: 'string'
  })
  @IsOptional()
  @IsString()
  note?: string;
}
