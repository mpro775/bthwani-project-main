import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class DailyReportQueryDto {
  @IsOptional()
  @IsString()
  date?: string;
}

export class DailyReportDto {
  date: Date;
  orders: number;
  revenue: number;
  newUsers: number;
}

export class WeeklyReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class MonthlyReportQueryDto {
  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;
}

export class ExportReportQueryDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
