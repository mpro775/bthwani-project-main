import {
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GasConfigDto {
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون true أو false' })
  enabled: boolean;

  @IsNumber({}, { message: 'حجم الأسطوانة يجب أن يكون رقماً' })
  @Min(1)
  cylinderSizeLiters: number;

  @IsNumber({}, { message: 'سعر الأسطوانة يجب أن يكون رقماً' })
  @Min(0)
  pricePerCylinder: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى للكمية يجب أن يكون رقماً' })
  @Min(1)
  minQty?: number;

  @IsOptional()
  @IsObject()
  deliveryOverride?: {
    policy: 'flat' | 'strategy';
    flatFee?: number;
  };
}

export class WaterSizeDto {
  @IsEnum(['small', 'medium', 'large'], {
    message: 'المفتاح يجب أن يكون small أو medium أو large',
  })
  key: string;

  @IsNumber({}, { message: 'السعة يجب أن تكون رقماً' })
  @Min(1)
  capacityLiters: number;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0)
  pricePerTanker: number;
}

export class WaterConfigDto {
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون true أو false' })
  enabled: boolean;

  @IsArray({ message: 'الأحجام يجب أن تكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => WaterSizeDto)
  sizes: WaterSizeDto[];

  @IsBoolean({ message: 'السماح بنصف وايت يجب أن يكون true أو false' })
  allowHalf: boolean;

  @IsEnum(['linear', 'multiplier', 'fixed'], {
    message: 'سياسة نصف الوايت غير صحيحة',
  })
  halfPricingPolicy: string;

  @IsOptional()
  @IsNumber({}, { message: 'المعامل الخطي يجب أن يكون رقماً' })
  halfLinearFactor?: number;

  @IsOptional()
  @IsNumber({}, { message: 'المضاعف يجب أن يكون رقماً' })
  halfMultiplier?: number;

  @IsOptional()
  @IsNumber({}, { message: 'المبلغ الثابت يجب أن يكون رقماً' })
  halfFixedAmount?: number;

  @IsOptional()
  @IsObject()
  deliveryOverride?: {
    policy: 'flat' | 'strategy';
    flatFee?: number;
  };
}

export class CreateUtilityPricingDto {
  @IsString({ message: 'المدينة مطلوبة' })
  city: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  origins?: {
    gas?: { label?: string; lat: number; lng: number };
    water?: { label?: string; lat: number; lng: number };
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => GasConfigDto)
  gas?: GasConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WaterConfigDto)
  water?: WaterConfigDto;
}

export class UpdateUtilityPricingDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => GasConfigDto)
  gas?: GasConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WaterConfigDto)
  water?: WaterConfigDto;
}

export class GetUtilityOptionsDto {
  @IsOptional()
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  city?: string;
}

export class CalculateUtilityPriceDto {
  @IsEnum(['gas', 'water'], { message: 'نوع الخدمة يجب أن يكون gas أو water' })
  serviceType: 'gas' | 'water';

  @IsOptional()
  @IsString()
  city?: string;

  // للغاز
  @IsOptional()
  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1)
  quantity?: number;

  // للماء
  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  size?: string;

  @IsOptional()
  @IsBoolean()
  half?: boolean;

  // الموقع (للحساب بناءً على المسافة)
  @IsOptional()
  @IsObject()
  customerLocation?: { lat: number; lng: number };
}
