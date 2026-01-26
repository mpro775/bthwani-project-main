import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetSettingsResponseDto {
  general: any; // TODO: Define specific settings structure
  payment: any;
  delivery: any;
  commission: any;
}

export class UpdateSettingsDto {
  settings: any; // TODO: Define specific settings structure

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateSettingsResponseDto {
  success: boolean;
  message: string;
}

export class GetFeatureFlagsResponseDto {
  flags: any; // TODO: Define feature flags structure
}

export class UpdateFeatureFlagDto {
  @IsString()
  flag: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateFeatureFlagResponseDto {
  success: boolean;
  flag: string;
  enabled: boolean;
}
