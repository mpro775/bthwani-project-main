import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailOtpDto {
  @ApiProperty({
    description: 'رمز OTP',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'رمز OTP مطلوب' })
  @Length(6, 6, { message: 'رمز OTP يجب أن يكون 6 أرقام' })
  code: string;
}
