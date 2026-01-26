import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class GetLeaveRequestsQueryDto {
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

export class GetLeaveRequestsResponseDto {
  data: any[]; // TODO: Create LeaveRequest DTO
  total: number;
  page: number;
  limit: number;
}

export class ApproveLeaveRequestDto {
  @IsString()
  requestId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ApproveLeaveResponseDto {
  success: boolean;
  message: string;
}

export class RejectLeaveRequestDto {
  @IsString()
  requestId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class RejectLeaveResponseDto {
  success: boolean;
  message: string;
}

export class GetDriverLeaveBalanceResponseDto {
  annual: number;
  sick: number;
  emergency: number;
  used: number;
}

export class AdjustLeaveBalanceDto {
  @IsString()
  driverId: string;

  @IsNumber()
  days: number;

  @IsEnum(['add', 'deduct'])
  type: 'add' | 'deduct';

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AdjustLeaveBalanceResponseDto {
  success: boolean;
  message: string;
  newBalance: number;
}
