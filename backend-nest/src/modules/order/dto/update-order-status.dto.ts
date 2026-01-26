import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'الحالة الجديدة', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: string;

  @ApiPropertyOptional({ description: 'سبب التغيير' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'من قام بالتغيير',
    enum: ['admin', 'store', 'driver', 'customer'],
  })
  @IsOptional()
  @IsEnum(['admin', 'store', 'driver', 'customer'])
  changedBy?: string;
}
