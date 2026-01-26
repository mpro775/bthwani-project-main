import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDataDeletionRequestDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataTypes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hardDelete?: boolean;
}

export class ApproveDataDeletionDto {
  @ApiProperty()
  @IsMongoId()
  requestId: string;

  @ApiProperty()
  @IsMongoId()
  adminId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledDate?: string; // فترة سماح قبل الحذف
}

export class RejectDataDeletionDto {
  @ApiProperty()
  @IsMongoId()
  requestId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsMongoId()
  adminId: string;
}

export class GetDataDeletionRequestsQueryDto {
  @ApiPropertyOptional({
    enum: [
      'pending',
      'under-review',
      'approved',
      'rejected',
      'processing',
      'completed',
    ],
  })
  @IsOptional()
  @IsEnum([
    'pending',
    'under-review',
    'approved',
    'rejected',
    'processing',
    'completed',
  ])
  status?: string;
}

