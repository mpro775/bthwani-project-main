import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPinDto {
  @ApiProperty({
    description: 'رمز PIN من 4 أرقام',
    example: '1234',
    minLength: 4,
    maxLength: 6,
  })
  @IsString()
  @Length(4, 6, { message: 'PIN must be between 4 and 6 digits' })
  @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
  pin: string;

  @ApiProperty({
    description: 'تأكيد رمز PIN',
    example: '1234',
  })
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/)
  confirmPin: string;
}

export class VerifyPinDto {
  @ApiProperty({
    description: 'رمز PIN للتحقق',
    example: '1234',
  })
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}
