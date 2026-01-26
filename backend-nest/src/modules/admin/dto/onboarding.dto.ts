import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetOnboardingApplicationsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class GetOnboardingApplicationsResponseDto {
  data: any[]; // TODO: Create OnboardingApplication DTO
  total: number;
  page: number;
  limit: number;
}

export class GetOnboardingDetailsResponseDto {
  application: any; // TODO: Create OnboardingApplication DTO
}

export class ApproveOnboardingDto {
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ApproveOnboardingResponseDto {
  success: boolean;
  message: string;
}

export class RejectOnboardingDto {
  @IsString()
  applicationId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class RejectOnboardingResponseDto {
  success: boolean;
  message: string;
}

export class GetOnboardingStatisticsResponseDto {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}
