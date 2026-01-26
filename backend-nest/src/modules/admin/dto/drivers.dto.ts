import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class GetAllDriversQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class GetAllDriversResponseDto {
  data: any[]; // TODO: Create Driver entity DTO
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DriverDetailsDto {
  driver: any; // TODO: Create Driver entity DTO
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

export class DriverPerformanceQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DriverPerformanceDto {
  totalOrders: number;
  totalEarnings: number;
  averageRating: number;
}

export class DriverFinancialsDto {
  wallet: {
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
}

export class BanDriverDto {
  @IsString()
  driverId: string;

  @IsString()
  reason: string;

  @IsString()
  adminId: string;
}

export class AdjustDriverBalanceDto {
  @IsString()
  driverId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['credit', 'debit'])
  type: 'credit' | 'debit';

  @IsString()
  reason: string;

  @IsString()
  adminId: string;
}

export class AdjustDriverBalanceResponseDto {
  success: boolean;
  newBalance: number;
}
