import { IsOptional, IsString } from 'class-validator';

export class GetSystemHealthResponseDto {
  status: string;
  database: string;
  redis: string;
  uptime: number;
  memory: any;
}

export class GetSystemMetricsResponseDto {
  cpu: number;
  memory: any;
  uptime: number;
  activeConnections: number;
}

export class GetSystemErrorsQueryDto {
  @IsOptional()
  @IsString()
  severity?: string;
}

export class GetSystemErrorsResponseDto {
  data: any[]; // TODO: Create SystemError DTO
  total: number;
}

export class GetDatabaseStatsResponseDto {
  users: number;
  orders: number;
  drivers: number;
  stores: number;
  vendors: number;
}

export class CleanupDatabaseResponseDto {
  success: boolean;
  message: string;
}
