import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VendorLoginDto {
  @ApiProperty({ description: 'رقم الهاتف' })
  @IsString()
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'رقم الهاتف غير صالح (7-15 رقم)',
  })
  phone: string;

  @ApiProperty({ description: 'كلمة المرور' })
  @IsString()
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}
