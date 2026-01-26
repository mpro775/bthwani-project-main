import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiPropertyOptional({ description: 'العنوان', example: 'عرض خاص' })
  @IsOptional()
  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  title?: string;

  @ApiPropertyOptional({
    description: 'الوصف',
    example: 'خصم 50% على جميع المنتجات',
  })
  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @ApiProperty({
    description: 'الصورة',
    example: 'https://example.com/banner.jpg',
  })
  @IsString({ message: 'الصورة مطلوبة' })
  image: string;

  @ApiPropertyOptional({ description: 'الرابط', example: '/products/123' })
  @IsOptional()
  @IsString({ message: 'الرابط يجب أن يكون نصاً' })
  link?: string;

  @ApiPropertyOptional({ description: 'معرف المتجر' })
  @IsOptional()
  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store?: string;

  @ApiPropertyOptional({ description: 'معرف الفئة' })
  @IsOptional()
  @IsMongoId({ message: 'معرف الفئة غير صحيح' })
  category?: string;

  @ApiPropertyOptional({
    description: 'موضع العرض',
    enum: ['home', 'category', 'store', 'search'],
    example: 'home',
  })
  @IsOptional()
  @IsEnum(['home', 'category', 'store', 'search'], {
    message: 'الموضع غير صحيح',
  })
  placement?: string;

  @ApiProperty({ description: 'الترتيب', example: 1, default: 0 })
  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  @Min(0)
  order: number;

  @ApiPropertyOptional({ description: 'تاريخ البداية', example: '2025-01-01' })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صحيح' })
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'تاريخ النهاية', example: '2025-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صحيح' })
  @Type(() => Date)
  endDate?: Date;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
