import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PricingTierDto {
  @ApiProperty({ description: 'بداية الشريحة بالكم' })
  @IsNumber()
  @Min(0)
  minDistance: number;

  @ApiProperty({ description: 'نهاية الشريحة بالكم' })
  @IsNumber()
  @Min(0)
  maxDistance: number;

  @ApiProperty({ description: 'سعر الكيلومتر بالريال' })
  @IsNumber()
  @Min(0)
  pricePerKm: number;
}

export class CreatePricingStrategyDto {
  @ApiProperty({ description: 'اسم الاستراتيجية' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'المسافة الأساسية بالكم' })
  @IsNumber()
  @Min(0)
  baseDistance: number;

  @ApiProperty({ description: 'السعر الأساسي بالريال' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({
    description: 'شرائح المسافات',
    type: [PricingTierDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers?: PricingTierDto[];

  @ApiProperty({ description: 'سعر الكيلومتر الافتراضي بالريال' })
  @IsNumber()
  @Min(0)
  defaultPricePerKm: number;

  @ApiPropertyOptional({ description: 'هل هذه الاستراتيجية الافتراضية؟' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePricingStrategyDto {
  @ApiPropertyOptional({ description: 'اسم الاستراتيجية' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'المسافة الأساسية بالكم' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseDistance?: number;

  @ApiPropertyOptional({ description: 'السعر الأساسي بالريال' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'شرائح المسافات',
    type: [PricingTierDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers?: PricingTierDto[];

  @ApiPropertyOptional({ description: 'سعر الكيلومتر الافتراضي بالريال' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPricePerKm?: number;

  @ApiPropertyOptional({ description: 'هل هذه الاستراتيجية الافتراضية؟' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
