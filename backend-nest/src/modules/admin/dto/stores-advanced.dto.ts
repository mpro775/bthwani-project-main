import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class GetTopStoresQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class GetTopStoresResponseDto {
  data: any[]; // TODO: Create Store ranking DTO
}

export class GetStoreOrdersHistoryQueryDto {
  @IsString()
  storeId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetStoreOrdersHistoryResponseDto {
  data: any[]; // TODO: Create Order history DTO
  total: number;
}
