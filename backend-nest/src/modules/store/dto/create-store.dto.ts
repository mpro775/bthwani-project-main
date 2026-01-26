import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

export class CreateStoreDto {
  @ApiProperty({ description: 'اسم المتجر' })
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

  @ApiProperty({ description: 'العنوان' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'الموقع', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({ description: 'معرف الفئة' })
  @IsOptional()
  @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'صورة المتجر' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'الشعار' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'نسبة العمولة' })
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional({
    description: 'نوع المتجر',
    enum: ['restaurant', 'grocery', 'pharmacy', 'bakery', 'cafe', 'other'],
  })
  @IsOptional()
  @IsEnum(['restaurant', 'grocery', 'pharmacy', 'bakery', 'cafe', 'other'])
  usageType?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
