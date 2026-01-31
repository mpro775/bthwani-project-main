import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsEnum,
  IsEmail,
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

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['rider_driver', 'light_driver', 'women_driver'])
  role?: string;

  @IsOptional()
  @IsEnum(['motor', 'bike', 'car'])
  vehicleType?: string;

  @IsOptional()
  @IsEnum(['primary', 'joker'])
  driverType?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;
}
