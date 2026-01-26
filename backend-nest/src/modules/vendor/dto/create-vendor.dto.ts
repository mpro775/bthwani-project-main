import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ description: 'الاسم الكامل' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'كلمة المرور' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'معرف المتجر' })
  @IsMongoId()
  @IsNotEmpty()
  store: string;

  @ApiPropertyOptional({ description: 'معرف المسوق' })
  @IsOptional()
  @IsString()
  createdByMarketerUid?: string;

  @ApiPropertyOptional({
    description: 'المصدر',
    enum: ['marketerQuickOnboard', 'admin', 'other'],
  })
  @IsOptional()
  @IsEnum(['marketerQuickOnboard', 'admin', 'other'])
  source?: string;
}
