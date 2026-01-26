import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'الاسم الكامل', example: 'أحمد محمد' })
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  fullName: string;

  @ApiPropertyOptional({ description: 'الاسم المستعار' })
  @IsOptional()
  @IsString()
  aliasName?: string;

  @ApiPropertyOptional({
    description: 'البريد الإلكتروني',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف', example: '+967771234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'صورة الملف الشخصي' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Firebase UID للمصادقة' })
  @IsOptional()
  @IsString()
  firebaseUID?: string;
}
