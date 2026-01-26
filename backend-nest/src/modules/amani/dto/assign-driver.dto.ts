import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export default class AssignDriverDto {
  @ApiProperty({
    description: 'معرف السائق المراد تعيينه',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsString()
  driverId: string;

  @ApiProperty({
    description: 'ملاحظة إضافية عند التعيين',
    example: 'تم التعيين تلقائياً',
    required: false,
    type: 'string'
  })
  @IsOptional()
  @IsString()
  note?: string;
}
