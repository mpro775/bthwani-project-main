import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'البريد الإلكتروني أو رقم الهاتف',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'البريد الإلكتروني أو رقم الهاتف مطلوب' })
  @IsString()
  emailOrPhone: string;
}

export class VerifyResetCodeDto {
  @ApiProperty({
    description: 'البريد الإلكتروني أو رقم الهاتف',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'البريد الإلكتروني أو رقم الهاتف مطلوب' })
  @IsString()
  emailOrPhone: string;

  @ApiProperty({
    description: 'رمز التحقق',
    example: '123456',
  })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @IsString()
  code: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'البريد الإلكتروني أو رقم الهاتف',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'البريد الإلكتروني أو رقم الهاتف مطلوب' })
  @IsString()
  emailOrPhone: string;

  @ApiProperty({
    description: 'رمز التحقق',
    example: '123456',
  })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'كلمة المرور الجديدة',
    example: 'NewPassword123!',
  })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  newPassword: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'رقم الهاتف',
    example: '+967771234567',
  })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'رمز OTP',
    example: '123456',
  })
  @IsNotEmpty({ message: 'رمز OTP مطلوب' })
  @IsString()
  otp: string;
}

