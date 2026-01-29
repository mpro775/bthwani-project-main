import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsArray, Min } from 'class-validator';
import { KenzStatus } from './create-kenz.dto';

export default class UpdateKenzDto {
  @ApiProperty({ description: 'عنوان الإعلان', required: false, example: 'iPhone 14 Pro محدث' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'تفاصيل محدثة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'السعر', required: false, example: 3400 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'الفئة', required: false, example: 'إلكترونيات' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'أسود' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: KenzStatus, example: KenzStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(KenzStatus)
  status?: KenzStatus;

  @ApiProperty({ description: 'روابط صور CDN (Bunny)', required: false, example: ['https://cdn.bthwani.com/kenz/1-img.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'المدينة (من الـ 22 محافظة يمنية)', required: false, example: 'صنعاء' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'كلمات مفتاحية', required: false, example: ['جوال', 'أيفون'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({ description: 'العملة', required: false, example: 'ريال يمني' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'الكمية', required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
