import { IsString, IsOptional } from 'class-validator';

export class PauseSystemDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class PauseSystemResponseDto {
  success: boolean;
  message: string;
  reason: string;
}

export class ResumeSystemDto {
  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ResumeSystemResponseDto {
  success: boolean;
  message: string;
}
