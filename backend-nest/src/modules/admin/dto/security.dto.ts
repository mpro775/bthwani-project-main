import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetFailedPasswordAttemptsQueryDto {
  @IsOptional()
  @IsNumber()
  threshold?: number = 5;
}

export class GetFailedPasswordAttemptsResponseDto {
  data: any[]; // TODO: Create LoginAttempt DTO
  total: number;
}

export class ResetUserPasswordDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  tempPassword?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ResetUserPasswordResponseDto {
  success: boolean;
  message: string;
  tempPassword: string;
}

export class UnlockAccountDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UnlockAccountResponseDto {
  success: boolean;
  message: string;
}
