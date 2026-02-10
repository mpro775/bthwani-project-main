import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO لتسجيل دخول السائق باستخدام رقم الهاتف وكلمة المرور.
 * رقم الهاتف: تنسيق اليمن (9 أرقام تبدأ بـ 77 أو 78 أو 71 أو 73).
 */
export class DriverLoginDto {
  @ApiProperty({
    description: 'رقم الهاتف (9 أرقام، يبدأ بـ 77 أو 78 أو 71 أو 73)',
    example: '771234567',
    minLength: 9,
    maxLength: 9,
  })
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @Matches(/^7[1378]\d{7}$/, {
    message: 'رقم الهاتف غير صالح. يجب أن يكون 9 أرقام ويبدأ بـ 77 أو 78 أو 71 أو 73',
  })
  @MinLength(9, { message: 'رقم الهاتف يجب أن يكون 9 أرقام' })
  @MaxLength(9, { message: 'رقم الهاتف يجب أن يكون 9 أرقام' })
  phone: string;

  @ApiProperty({
    description: 'كلمة المرور',
    example: 'SecurePass123',
    minLength: 6,
  })
  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}
