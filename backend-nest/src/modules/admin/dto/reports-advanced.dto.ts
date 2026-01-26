import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class GetDriversPerformanceReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetDriversPerformanceReportResponseDto {
  data: any[]; // TODO: Create Driver performance report DTO
}

export class GetStoresPerformanceReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetStoresPerformanceReportResponseDto {
  data: any[]; // TODO: Create Store performance report DTO
}

export class GetDetailedFinancialReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetDetailedFinancialReportResponseDto {
  revenue: number;
  costs: number;
  profit: number;
  breakdown: any[]; // TODO: Define breakdown structure
}

export class GetUserActivityReportResponseDto {
  activeUsers: number;
  newUsers: number;
}
