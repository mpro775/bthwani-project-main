import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'اسم المنتج' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'الاسم بالعربي' })
  @IsOptional()
  @IsString()
  name_ar?: string;

  @ApiPropertyOptional({ description: 'الاسم بالإنجليزي' })
  @IsOptional()
  @IsString()
  name_en?: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'السعر' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'معرف المتجر' })
  @IsMongoId()
  @IsNotEmpty()
  store: string;

  @ApiPropertyOptional({ description: 'معرف الفئة' })
  @IsOptional()
  @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'صورة المنتج' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'الصور', type: [String], default: [] })
  @IsArray()
  images: string[];

  @ApiProperty({ description: 'متوفر في المخزون', default: true })
  @IsBoolean()
  inStock: boolean;

  @ApiProperty({ description: 'كمية المخزون', default: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ description: 'الخصم', default: 0 })
  @IsNumber()
  @Min(0)
  discount: number;
}
