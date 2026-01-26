import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsIn,
} from 'class-validator';

export class RecordConsentDto {
  @ApiProperty({
    description: 'نوع الموافقة',
    enum: ['privacy_policy', 'terms_of_service'],
    example: 'privacy_policy',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['privacy_policy', 'terms_of_service'])
  consentType: string;

  @ApiProperty({ description: 'إصدار المستند', example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'هل تمت الموافقة', default: true })
  @IsBoolean()
  @IsNotEmpty()
  accepted: boolean;

  @ApiProperty({ description: 'عنوان IP', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
