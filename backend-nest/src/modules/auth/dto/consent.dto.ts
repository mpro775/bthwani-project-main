import {
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConsentType {
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  MARKETING = 'marketing',
  DATA_PROCESSING = 'data_processing',
}

export class ConsentDto {
  @ApiProperty({
    description: 'نوع الموافقة',
    enum: ConsentType,
    example: ConsentType.PRIVACY_POLICY,
  })
  @IsEnum(ConsentType, { message: 'نوع الموافقة غير صالح' })
  @IsNotEmpty({ message: 'نوع الموافقة مطلوب' })
  consentType: ConsentType;

  @ApiProperty({
    description: 'حالة الموافقة (موافق/غير موافق)',
    example: true,
  })
  @IsBoolean({ message: 'يجب أن تكون الموافقة true أو false' })
  granted: boolean;

  @ApiProperty({
    description: 'نسخة السياسة أو الشروط',
    example: '1.0.0',
  })
  @IsString({ message: 'النسخة يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'نسخة السياسة مطلوبة' })
  version: string;

  @ApiPropertyOptional({
    description: 'ملاحظات إضافية',
    example: 'موافقة تلقائية عند التسجيل',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkConsentDto {
  @ApiProperty({
    description: 'قائمة الموافقات المتعددة',
    type: [ConsentDto],
  })
  consents: ConsentDto[];
}

export class ConsentResponseDto {
  @ApiProperty({ description: 'معرف الموافقة' })
  id: string;

  @ApiProperty({ description: 'معرف المستخدم' })
  userId: string;

  @ApiProperty({ description: 'نوع الموافقة', enum: ConsentType })
  consentType: ConsentType;

  @ApiProperty({ description: 'حالة الموافقة' })
  granted: boolean;

  @ApiProperty({ description: 'نسخة السياسة' })
  version: string;

  @ApiProperty({ description: 'تاريخ الموافقة' })
  consentDate: Date;

  @ApiProperty({ description: 'عنوان IP' })
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent' })
  userAgent?: string;

  @ApiProperty({ description: 'تاريخ السحب' })
  withdrawnAt?: Date;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;

  @ApiProperty({ description: 'تاريخ التحديث' })
  updatedAt: Date;
}
