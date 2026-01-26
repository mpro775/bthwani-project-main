import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class GetAnalyticsOverviewQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetAnalyticsOverviewResponseDto {
  orders: any; // TODO: Define orders analytics structure
  revenue: any;
  users: any;
  drivers: any;
}

export class GetTrendsQueryDto {
  @IsString()
  metric: string;

  @IsOptional()
  @IsNumber()
  days?: number = 30;
}

export class GetTrendsResponseDto {
  data: any[]; // TODO: Define trend data structure
}

export class GetComparisonsQueryDto {
  @IsDateString()
  p1Start: string;

  @IsDateString()
  p1End: string;

  @IsDateString()
  p2Start: string;

  @IsDateString()
  p2End: string;
}

export class GetComparisonsResponseDto {
  period1: any; // TODO: Define period comparison structure
  period2: any;
  difference: any;
}
