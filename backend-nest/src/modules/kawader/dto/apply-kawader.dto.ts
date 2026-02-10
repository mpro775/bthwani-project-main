import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export default class ApplyKawaderDto {
  @ApiProperty({
    description: 'رسالة التقديم (اختيارية)',
    required: false,
    example: 'لدي خبرة 4 سنوات في React و Node.js وأرغب بالانضمام لفريقكم',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverNote?: string;
}
