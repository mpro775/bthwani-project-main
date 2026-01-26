import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateTermsOfServiceDto {
  @ApiProperty({ description: 'إصدار الشروط', example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'محتوى الشروط بالعربية' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'محتوى الشروط بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  contentEn: string;

  @ApiProperty({ description: 'تاريخ سريان الشروط', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @ApiProperty({
    description: 'هل الشروط نشطة',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
