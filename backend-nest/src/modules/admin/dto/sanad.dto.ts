import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { SanadStatus, SanadKind, SanadListResponse, SanadStats, SanadAdminQuery, SanadStatusUpdateDto } from '../interfaces/admin.interfaces';
import { Types } from 'mongoose';

export class SanadAdminQueryDto implements SanadAdminQuery {
  @ApiProperty({ required: false, enum: SanadStatus })
  @IsOptional()
  @IsEnum(SanadStatus)
  status?: SanadStatus;

  @ApiProperty({ required: false, enum: SanadKind })
  @IsOptional()
  @IsEnum(SanadKind)
  kind?: SanadKind;

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

  @ApiProperty({ required: false, example: 'طلب فزعة' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class SanadStatusUpdateAdminDto implements SanadStatusUpdateDto {
  @ApiProperty({ enum: SanadStatus, example: SanadStatus.CONFIRMED })
  @IsEnum(SanadStatus)
  status: SanadStatus;

  @ApiProperty({ required: false, example: 'تم الموافقة على الطلب من قبل الإدارة' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SanadListResponseDto implements SanadListResponse {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: any[];

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439012' })
  nextCursor?: string;
}

export class SanadStatsDto implements SanadStats {
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

  @ApiProperty({ example: 80 })
  specialist: number;

  @ApiProperty({ example: 50 })
  emergency: number;

  @ApiProperty({ example: 20 })
  charity: number;
}

export class SanadAdminActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'تم تحديث حالة الطلب بنجاح' })
  message: string;

  @ApiProperty({ required: false })
  data?: any;
}
