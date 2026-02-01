import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/order-status.enum';

export class CreateOrderFromCartDto {
  @ApiProperty({ description: 'معرّف عنوان التوصيل' })
  @IsString()
  addressId: string;

  @ApiProperty({ description: 'طريقة الدفع', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'ملاحظات الطلب' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'كود القسيمة' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'وقت التوصيل المجدول (ISO)' })
  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @ApiPropertyOptional({ description: 'وضع التوصيل (unified | split)' })
  @IsOptional()
  @IsString()
  deliveryMode?: string;

  @ApiPropertyOptional({ description: 'بقشيش السائق' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  captainTip?: number;
}
