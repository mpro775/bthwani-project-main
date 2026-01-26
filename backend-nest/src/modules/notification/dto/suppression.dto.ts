import {
  IsEnum,
  IsString,
  IsOptional,
  IsDate,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SuppressionChannel,
  SuppressionReason,
} from '../entities/suppression.entity';

export class CreateSuppressionDto {
  @ApiProperty({
    description: 'القنوات المراد حظرها',
    enum: SuppressionChannel,
    isArray: true,
    example: ['email', 'push'],
  })
  @IsArray()
  @IsEnum(SuppressionChannel, { each: true })
  suppressedChannels: SuppressionChannel[];

  @ApiProperty({
    description: 'سبب الحظر',
    enum: SuppressionReason,
    example: SuppressionReason.USER_REQUEST,
  })
  @IsEnum(SuppressionReason)
  reason: SuppressionReason;

  @ApiPropertyOptional({
    description: 'تفاصيل إضافية',
    example: 'المستخدم طلب إيقاف الإشعارات',
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    description: 'تاريخ انتهاء الحظر',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;
}

export class UpdateSuppressionDto {
  @ApiPropertyOptional({
    description: 'القنوات المحظورة',
    enum: SuppressionChannel,
    isArray: true,
  })
  @IsArray()
  @IsEnum(SuppressionChannel, { each: true })
  @IsOptional()
  suppressedChannels?: SuppressionChannel[];

  @ApiPropertyOptional({ description: 'هل الحظر نشط؟' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'تاريخ انتهاء الحظر' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'تفاصيل إضافية' })
  @IsString()
  @IsOptional()
  details?: string;
}

export class SuppressionResponseDto {
  @ApiProperty({ description: 'معرف الحظر' })
  id: string;

  @ApiProperty({ description: 'معرف المستخدم' })
  userId: string;

  @ApiProperty({
    description: 'القنوات المحظورة',
    enum: SuppressionChannel,
    isArray: true,
  })
  suppressedChannels: SuppressionChannel[];

  @ApiProperty({ description: 'سبب الحظر', enum: SuppressionReason })
  reason: SuppressionReason;

  @ApiProperty({ description: 'تفاصيل' })
  details?: string;

  @ApiProperty({ description: 'تاريخ الانتهاء' })
  expiresAt?: Date;

  @ApiProperty({ description: 'نشط؟' })
  isActive: boolean;

  @ApiProperty({ description: 'من قام بالحظر' })
  suppressedBy: string;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;

  @ApiProperty({ description: 'تاريخ التحديث' })
  updatedAt: Date;
}

export class SuppressionStatsDto {
  @ApiProperty({ description: 'إجمالي عدد الحظر' })
  total: number;

  @ApiProperty({ description: 'عدد الحظر النشط' })
  active: number;

  @ApiProperty({ description: 'عدد الحظر غير النشط' })
  inactive: number;

  @ApiProperty({
    description: 'إحصائيات حسب السبب',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', enum: Object.values(SuppressionReason) },
        count: { type: 'number' },
      },
    },
  })
  byReason: Array<{ _id: string; count: number }>;

  @ApiProperty({
    description: 'إحصائيات حسب القناة',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', enum: Object.values(SuppressionChannel) },
        count: { type: 'number' },
      },
    },
  })
  byChannel: Array<{ _id: string; count: number }>;
}