import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class GenerateActivationCodesDto {
  @IsNumber()
  count: number;

  @IsOptional()
  @IsNumber()
  expiryDays?: number;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class GenerateActivationCodesResponseDto {
  success: boolean;
  codes: string[];
  count: number;
}

export class GetActivationCodesQueryDto {
  @IsOptional()
  @IsEnum(['unused', 'used', 'expired'])
  status?: 'unused' | 'used' | 'expired';

  @IsOptional()
  @IsEnum(['driver', 'vendor', 'any'])
  userType?: 'driver' | 'vendor' | 'any';
}

/**
 * DTO لبيانات كود التفعيل
 */
export class ActivationCodeDto {
  code: string;
  userType: 'driver' | 'vendor' | 'any';
  status: 'unused' | 'used' | 'expired';
  expiresAt?: string;
  usedBy?: string;
  usedAt?: string;
  generatedBy: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class GetActivationCodesResponseDto {
  data: ActivationCodeDto[];
  total: number;
}
