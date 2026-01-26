import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetAllMarketersQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class GetAllMarketersResponseDto {
  data: any[]; // TODO: Create Marketer DTO
  total: number;
  page: number;
  limit: number;
}

export class GetMarketerDetailsResponseDto {
  marketer: any; // TODO: Create Marketer DTO
  stats: any; // TODO: Define marketer stats structure
}

export class CreateMarketerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  commissionRate?: number;
}

export class CreateMarketerResponseDto {
  success: boolean;
  message: string;
  marketer: CreateMarketerDto;
}

export class UpdateMarketerDto {
  @IsString()
  marketerId: string;

  updates: any; // TODO: Create specific update DTO

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateMarketerResponseDto {
  success: boolean;
  message: string;
}

export class GetMarketerPerformanceQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetMarketerPerformanceResponseDto {
  storesOnboarded: number;
  totalCommission: number;
  activeStores: number;
  periodRevenue: number;
}

export class GetMarketerStoresResponseDto {
  data: any[]; // TODO: Create Store DTO
  total: number;
}

export class GetMarketerCommissionsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class GetMarketerCommissionsResponseDto {
  data: any[]; // TODO: Create Commission DTO
  total: number;
  totalAmount: number;
}

export class ActivateMarketerDto {
  @IsString()
  marketerId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ActivateMarketerResponseDto {
  success: boolean;
  message: string;
}

export class DeactivateMarketerDto {
  @IsString()
  marketerId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class DeactivateMarketerResponseDto {
  success: boolean;
  message: string;
}

export class AdjustMarketerCommissionDto {
  @IsString()
  marketerId: string;

  @IsNumber()
  rate: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AdjustMarketerCommissionResponseDto {
  success: boolean;
  message: string;
  newRate: number;
}

export class GetMarketersStatisticsQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetMarketersStatisticsResponseDto {
  totalMarketers: number;
  activeMarketers: number;
  totalStoresOnboarded: number;
  totalCommissionsPaid: number;
}
