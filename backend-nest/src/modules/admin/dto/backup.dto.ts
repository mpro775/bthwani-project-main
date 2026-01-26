import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateBackupDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collections?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class CreateBackupResponseDto {
  success: boolean;
  message: string;
  backupId: string;
}

export class ListBackupsQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class ListBackupsResponseDto {
  data: any[]; // TODO: Create Backup DTO
  total: number;
  page: number;
  limit: number;
}

export class RestoreBackupDto {
  @IsString()
  backupId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class RestoreBackupResponseDto {
  success: boolean;
  message: string;
}

export class DownloadBackupResponseDto {
  url: string;
}
