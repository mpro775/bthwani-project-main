import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class GetTopDriversQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class GetTopDriversResponseDto {
  data: any[]; // TODO: Create Driver ranking DTO
}

export class GetDriversByStatusResponseDto {
  data: Array<{
    _id: string;
    count: number;
  }>;
}

export class CalculateDriverPayoutDto {
  @IsString()
  driverId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class CalculateDriverPayoutResponseDto {
  totalEarnings: number;
  orders: number;
  payoutAmount: number;
}
