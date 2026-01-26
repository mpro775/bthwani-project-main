import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum WalletUsersSortBy {
  BALANCE = 'balance',
  ON_HOLD = 'onHold',
  TOTAL_EARNED = 'totalEarned',
  TOTAL_SPENT = 'totalSpent',
  CREATED_AT = 'createdAt',
}

export class WalletUsersFilterDto {
  @ApiPropertyOptional({
    description: 'البحث في الاسم، البريد الإلكتروني، أو رقم الهاتف',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'الحد الأدنى للرصيد',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBalance?: number;

  @ApiPropertyOptional({
    description: 'الحد الأقصى للرصيد',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBalance?: number;

  @ApiPropertyOptional({
    description: 'الحد الأدنى للرصيد المحجوز',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOnHold?: number;

  @ApiPropertyOptional({
    description: 'الحد الأقصى للرصيد المحجوز',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxOnHold?: number;

  @ApiPropertyOptional({
    description: 'ترتيب النتائج',
    enum: WalletUsersSortBy,
    default: WalletUsersSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(WalletUsersSortBy)
  sortBy?: WalletUsersSortBy = WalletUsersSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'ترتيب تصاعدي أو تنازلي',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'رقم الصفحة',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'عدد العناصر في الصفحة',
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
