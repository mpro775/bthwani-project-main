import { IsNotEmpty, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'نوع النموذج', enum: ['User', 'Driver'] })
  @IsEnum(['User', 'Driver'])
  userModel: string;
}
