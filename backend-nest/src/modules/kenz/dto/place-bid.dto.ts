import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export default class PlaceBidDto {
  @ApiProperty({ description: 'مبلغ المزايدة', example: 1500 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
