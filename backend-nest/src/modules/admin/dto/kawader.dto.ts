import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { KawaderStatus, KawaderListResponse, KawaderStats, KawaderAdminQuery, KawaderStatusUpdateDto } from '../interfaces/admin.interfaces';
import { Types } from 'mongoose';
export class KawaderAdminQueryDto implements KawaderAdminQuery {
  @ApiProperty({ required: false, enum: KawaderStatus })
  @IsOptional()
  @IsEnum(KawaderStatus)
  status?: KawaderStatus;

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  ownerId?: Types.ObjectId;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  createdAfter?: Date;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  createdBefore?: Date;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMin?: number;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMax?: number;
}

export class KawaderStatusUpdateAdminDto implements KawaderStatusUpdateDto {
  @ApiProperty({ enum: KawaderStatus, example: KawaderStatus.CONFIRMED })
  @IsEnum(KawaderStatus)
  status: KawaderStatus;

  @ApiProperty({ required: false, example: 'تم الاعتماد من قبل الإدارة' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class KawaderListResponseDto implements KawaderListResponse {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: any[];

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439012' })
  nextCursor?: string;
}

export class KawaderStatsDto implements KawaderStats {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 45 })
  draft: number;

  @ApiProperty({ example: 23 })
  pending: number;

  @ApiProperty({ example: 67 })
  confirmed: number;

  @ApiProperty({ example: 12 })
  completed: number;

  @ApiProperty({ example: 3 })
  cancelled: number;
}

export class KawaderAdminActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'تم تحديث حالة العرض بنجاح' })
  message: string;

  @ApiProperty({ required: false })
  data?: any;
}
