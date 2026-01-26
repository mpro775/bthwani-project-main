import { IsString, IsOptional, IsArray } from 'class-validator';

export class GetCommissionPlansResponseDto {
  data: any[]; // TODO: Create CommissionPlan DTO
}

export class CreateCommissionPlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  tiers: Array<{
    minOrders: number;
    maxOrders?: number;
    rate: number;
  }>;

  @IsOptional()
  conditions?: string[];
}

export class CreateCommissionPlanResponseDto {
  success: boolean;
  message: string;
  plan: CreateCommissionPlanDto;
}

export class UpdateCommissionPlanDto {
  @IsString()
  planId: string;

  updates: any; // TODO: Create specific update DTO

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateCommissionPlanResponseDto {
  success: boolean;
  message: string;
}
