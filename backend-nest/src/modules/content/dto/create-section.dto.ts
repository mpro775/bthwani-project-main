import {
  IsString,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreSectionDto {
  @ApiProperty({ description: 'معرف المتجر' })
  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store: string;

  @ApiProperty({ description: 'الاسم', example: 'خضروات' })
  @IsString({ message: 'الاسم مطلوب' })
  name: string;

  @ApiPropertyOptional({ description: 'الاسم بالعربية', example: 'خضروات' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional({
    description: 'الوصف',
    example: 'قسم الخضروات الطازجة',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'الأيقونة', example: '🥕' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'نوع الاستخدام',
    enum: ['grocery', 'restaurant', 'retail'],
    example: 'grocery',
  })
  @IsEnum(['grocery', 'restaurant', 'retail'], {
    message: 'نوع الاستخدام غير صحيح',
  })
  usageType: string;

  @ApiProperty({ description: 'الترتيب', example: 1, default: 0 })
  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  @Min(0)
  order: number;
}

export class UpdateStoreSectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
