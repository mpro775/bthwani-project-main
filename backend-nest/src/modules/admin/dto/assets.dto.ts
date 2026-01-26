import { IsString, IsOptional } from 'class-validator';

export class GetDriverAssetsResponseDto {
  data: any[]; // TODO: Create Asset DTO
  total: number;
}

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsOptional()
  condition?: string;
}

export class CreateAssetResponseDto {
  success: boolean;
  message: string;
  asset: CreateAssetDto;
}

export class AssignAssetToDriverDto {
  @IsString()
  driverId: string;

  @IsString()
  assetId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AssignAssetResponseDto {
  success: boolean;
  message: string;
}

export class ReturnAssetFromDriverDto {
  @IsString()
  driverId: string;

  @IsString()
  assetId: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ReturnAssetResponseDto {
  success: boolean;
  message: string;
}
