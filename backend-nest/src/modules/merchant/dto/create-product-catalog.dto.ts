import {
  IsString,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeValueDto {
  @IsMongoId({ message: 'معرف الخاصية غير صحيح' })
  attribute: string;

  @IsString({ message: 'القيمة مطلوبة' })
  value: string;

  @IsOptional()
  @IsString()
  displayValue?: string;
}

export class CreateProductCatalogDto {
  @IsString({ message: 'الاسم مطلوب' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsMongoId({ message: 'معرف الفئة غير صحيح' })
  category: string;

  @IsOptional()
  @IsArray({ message: 'وحدات البيع يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  sellingUnits?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  attributes?: AttributeValueDto[];

  @IsEnum(['grocery', 'restaurant', 'retail'], {
    message: 'نوع الاستخدام يجب أن يكون grocery أو restaurant أو retail',
  })
  usageType: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateProductCatalogDto {
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
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
