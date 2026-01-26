import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class GetOrdersByCityQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetOrdersByCityResponseDto {
  data: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
  }>;
}

export class GetOrdersByPaymentMethodResponseDto {
  data: Array<{
    _id: string;
    count: number;
  }>;
}

export class GetDisputedOrdersResponseDto {
  data: any[]; // TODO: Create DisputedOrder DTO
  total: number;
}

export class ResolveDisputeDto {
  @IsString()
  orderId: string;

  @IsString()
  resolution: string;

  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ResolveDisputeResponseDto {
  success: boolean;
  message: string;
}
