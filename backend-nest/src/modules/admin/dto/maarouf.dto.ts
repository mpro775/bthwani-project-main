import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { MaaroufStatus, MaaroufKind, MaaroufListResponse, MaaroufStats, MaaroufAdminQuery, MaaroufStatusUpdateDto } from '../interfaces/admin.interfaces';
import { Types } from 'mongoose';
export class MaaroufAdminQueryDto implements MaaroufAdminQuery {
  @ApiProperty({ required: false, enum: MaaroufStatus })
  @IsOptional()
  @IsEnum(MaaroufStatus)
  status?: MaaroufStatus;

  @ApiProperty({ required: false, enum: MaaroufKind })
  @IsOptional()
  @IsEnum(MaaroufKind)
  kind?: MaaroufKind;

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  ownerId?: Types.ObjectId;

  @ApiProperty({ required: false, type: [String], example: ['محفظة', 'بطاقات'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  createdAfter?: Date;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
    createdBefore?: Date;

  @ApiProperty({ required: false, example: 'محفظة سوداء' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class MaaroufStatusUpdateAdminDto implements MaaroufStatusUpdateDto {
  @ApiProperty({ enum: MaaroufStatus, example: MaaroufStatus.CONFIRMED })
  @IsEnum(MaaroufStatus)
  status: MaaroufStatus;

  @ApiProperty({ required: false, example: 'تم الموافقة على الإعلان من قبل الإدارة' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MaaroufListResponseDto implements MaaroufListResponse {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: any[];

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439012' })
  nextCursor?: string;
}

export class MaaroufStatsDto implements MaaroufStats {
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
  lost: number;

  @ApiProperty({ example: 70 })
  found: number;
}

export class MaaroufAdminActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'تم تحديث حالة الإعلان بنجاح' })
  message: string;

  @ApiProperty({ required: false })
  data?: any;
}
