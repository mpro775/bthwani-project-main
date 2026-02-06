import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum, IsDateString, IsOptional } from 'class-validator';

export enum CreateKenzBoostType {
  HIGHLIGHT = 'highlight',
  PIN = 'pin',
  TOP = 'top',
}

export default class CreateKenzBoostDto {
  @ApiProperty({ description: 'معرف إعلان كنز' })
  @IsMongoId()
  kenzId: string;

  @ApiProperty({ description: 'تاريخ بداية الترويج (ISO)', example: '2025-02-05T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'تاريخ نهاية الترويج (ISO)', example: '2025-02-12T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'نوع الترويج', enum: CreateKenzBoostType, default: 'highlight' })
  @IsEnum(CreateKenzBoostType)
  @IsOptional()
  boostType?: CreateKenzBoostType;

  @ApiProperty({ description: 'معرف المستخدم الذي أنشأ الترويج (اختياري)' })
  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
