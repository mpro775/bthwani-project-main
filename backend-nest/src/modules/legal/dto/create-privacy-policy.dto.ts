import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreatePrivacyPolicyDto {
  @ApiProperty({ description: 'إصدار السياسة', example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'محتوى السياسة بالعربية' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'محتوى السياسة بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  contentEn: string;

  @ApiProperty({ description: 'تاريخ سريان السياسة', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @ApiProperty({
    description: 'هل السياسة نشطة',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
