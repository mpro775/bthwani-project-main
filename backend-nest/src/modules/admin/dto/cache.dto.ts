import { IsOptional, IsString } from 'class-validator';

export class ClearCacheDto {
  @IsOptional()
  @IsString()
  key?: string;
}

export class ClearCacheResponseDto {
  success: boolean;
  message: string;
}

export class GetCacheStatsResponseDto {
  keys: number;
  size: number;
  hitRate: number;
}
