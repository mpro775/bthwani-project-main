import {
  IsString,
  IsNumber,
  IsMongoId,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MerchantProductAttributeDto {
  @IsMongoId({ message: 'معرف الخاصية غير صحيح' })
  attribute: string;

  @IsString({ message: 'القيمة مطلوبة' })
  value: string;

  @IsOptional()
  @IsString()
  displayValue?: string;
}

export class CreateMerchantProductDto {
  @IsMongoId({ message: 'معرف التاجر غير صحيح' })
  merchant: string;

  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store: string;

  @IsMongoId({ message: 'معرف المنتج من الكتالوج غير صحيح' })
  product: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون موجباً' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'السعر الأصلي يجب أن يكون رقماً' })
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'نسبة الخصم يجب أن تكون رقماً' })
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber({}, { message: 'المخزون يجب أن يكون رقماً' })
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  customImage?: string;

  @IsOptional()
  @IsString()
  customDescription?: string;

  @IsOptional()
  @IsMongoId()
  section?: string;

  @IsOptional()
  @IsEnum(['catalog', 'merchant', 'imported'])
  origin?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  sellingUnit?: string;

  @IsOptional()
  @IsNumber()
  unitSize?: number;

  @IsOptional()
  @IsString()
  unitMeasure?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQtyPerOrder?: number;

  @IsOptional()
  @IsNumber()
  maxQtyPerOrder?: number;

  @IsOptional()
  @IsNumber()
  stepQty?: number;

  @IsOptional()
  @IsNumber()
  avgPrepTimeMin?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MerchantProductAttributeDto)
  customAttributes?: MerchantProductAttributeDto[];
}

export class UpdateMerchantProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  customDescription?: string;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}
