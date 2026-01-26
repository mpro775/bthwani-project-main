import {
  IsNotEmpty,
  IsMongoId,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, PaymentMethod } from '../enums/order-status.enum';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsEnum(['merchantProduct', 'deliveryProduct'])
  productType: string;

  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsMongoId()
  store: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}

class AddressDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  location: { lat: number; lng: number };
}

export class CreateOrderDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @ApiProperty({ description: 'عناصر الطلب', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'إجمالي السعر' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'رسوم التوصيل' })
  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @ApiProperty({ description: 'حصة الشركة' })
  @IsNumber()
  @Min(0)
  companyShare: number;

  @ApiProperty({ description: 'حصة المنصة' })
  @IsNumber()
  @Min(0)
  platformShare: number;

  @ApiProperty({ description: 'العنوان', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'طريقة الدفع', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ description: 'نوع الطلب', enum: OrderType })
  @IsEnum(OrderType)
  orderType: string;

  @ApiPropertyOptional({ description: 'المبلغ المستخدم من المحفظة' })
  @IsOptional()
  @IsNumber()
  walletUsed?: number;

  @ApiPropertyOptional({ description: 'المبلغ المتبقي كاش' })
  @IsOptional()
  @IsNumber()
  cashDue?: number;
}
