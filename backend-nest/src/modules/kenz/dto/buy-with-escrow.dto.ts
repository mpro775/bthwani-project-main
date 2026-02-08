import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export default class BuyWithEscrowDto {
  @ApiProperty({ description: 'مبلغ الشراء (يمكن أن يختلف عن سعر الإعلان للتفاوض)', example: 3500 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
