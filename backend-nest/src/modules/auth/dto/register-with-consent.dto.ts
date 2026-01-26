import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentDto } from './consent.dto';

/**
 * DTO موسّع للتسجيل مع الموافقات
 * يُستخدم في Registration Flow الجديد
 */
export class RegisterWithConsentDto {
  @ApiProperty({ description: 'الاسم الكامل', example: 'أحمد محمد' })
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'البريد الإلكتروني',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف', example: '+967770123456' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'صورة الملف الشخصي' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({
    description: 'Firebase ID Token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString({ message: 'Firebase token مطلوب' })
  @IsNotEmpty({ message: 'Firebase token مطلوب' })
  firebaseToken: string;

  // ==================== Consents ====================

  @ApiProperty({
    description: 'الموافقات المطلوبة',
    type: [ConsentDto],
    example: [
      {
        consentType: 'privacy_policy',
        granted: true,
        version: '1.0.0',
      },
      {
        consentType: 'terms_of_service',
        granted: true,
        version: '1.0.0',
      },
    ],
  })
  @IsArray({ message: 'الموافقات يجب أن تكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => ConsentDto)
  consents: ConsentDto[];

  @ApiPropertyOptional({
    description: 'تأكيد قراءة سياسة الخصوصية',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  acceptedPrivacyPolicy?: boolean;

  @ApiPropertyOptional({
    description: 'تأكيد قراءة شروط الخدمة',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  acceptedTermsOfService?: boolean;
}

/**
 * DTO مبسط للتسجيل مع موافقات افتراضية
 */
export class QuickRegisterDto {
  @ApiProperty({ description: 'الاسم الكامل' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Firebase ID Token' })
  @IsString()
  @IsNotEmpty()
  firebaseToken: string;

  @ApiProperty({
    description: 'الموافقة على الشروط والسياسات (مطلوب)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptAllTerms: boolean;
}
