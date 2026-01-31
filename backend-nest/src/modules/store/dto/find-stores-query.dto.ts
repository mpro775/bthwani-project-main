import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO لاستعلام GET /delivery/stores
 * يسمح بـ categoryId وفلترات أخرى مع الـ pagination
 */
export class FindStoresQueryDto {
  @ApiPropertyOptional({ description: 'Cursor للصفحة التالية' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'عدد العناصر', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'معرف الفئة لفلترة المتاجر' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'متاجر رائجة فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTrending?: boolean;

  @ApiPropertyOptional({ description: 'متاجر مميزة فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'نوع الاستخدام (delivery, grocery, ...)' })
  @IsOptional()
  @IsString()
  usageType?: string;
}
