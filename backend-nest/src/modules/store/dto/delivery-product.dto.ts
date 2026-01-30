import { IsOptional, IsString, IsNumber, IsBoolean, IsMongoId, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** شكل الطلب من لوحة التحكم (إنشاء/تحديث منتج توصيل) */
export class DeliveryProductCreateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  storeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}
