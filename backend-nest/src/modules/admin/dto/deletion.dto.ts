import { IsOptional, IsString } from 'class-validator';

export class GetDataDeletionRequestsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class GetDataDeletionRequestsResponseDto {
  data: any[]; // TODO: Create DataDeletionRequest DTO
  total: number;
}

export class ApproveDataDeletionDto {
  @IsString()
  requestId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ApproveDataDeletionResponseDto {
  success: boolean;
  message: string;
}

export class RejectDataDeletionDto {
  @IsString()
  requestId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class RejectDataDeletionResponseDto {
  success: boolean;
  message: string;
}
