import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export default class ReportKenzDto {
  @ApiProperty({ description: 'سبب الإبلاغ', example: 'محتوى غير لائق', minLength: 2, maxLength: 200 })
  @IsString()
  @MinLength(2, { message: 'يجب أن يكون سبب الإبلاغ حرفين على الأقل' })
  @MaxLength(200)
  reason: string;

  @ApiProperty({ description: 'ملاحظات إضافية (اختياري)', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
