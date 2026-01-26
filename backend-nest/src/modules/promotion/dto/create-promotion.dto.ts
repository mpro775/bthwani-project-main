import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
  IsMongoId,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PromotionTarget,
  PromotionValueType,
  PromotionPlacement,
  StackingRule,
} from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiPropertyOptional({ description: 'العنوان', example: 'عرض خاص' })
  @IsOptional()
  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  title?: string;

  @ApiPropertyOptional({
    description: 'الوصف',
    example: 'خصم 20% على جميع المنتجات',
  })
  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @ApiPropertyOptional({
    description: 'الصورة',
    example: 'https://example.com/promo.jpg',
  })
  @IsOptional()
  @IsString({ message: 'الصورة يجب أن تكون نصاً' })
  image?: string;

  @ApiPropertyOptional({ description: 'الرابط', example: '/products/123' })
  @IsOptional()
  @IsString({ message: 'الرابط يجب أن يكون نصاً' })
  link?: string;

  @ApiProperty({
    description: 'الهدف',
    enum: PromotionTarget,
    example: PromotionTarget.PRODUCT,
  })
  @IsEnum(PromotionTarget, {
    message: 'الهدف يجب أن يكون product أو store أو category',
  })
  target: PromotionTarget;

  @ApiPropertyOptional({ description: 'القيمة', example: 20 })
  @IsOptional()
  @IsNumber({}, { message: 'القيمة يجب أن تكون رقماً' })
  @Min(0)
  value?: number;

  @ApiPropertyOptional({
    description: 'نوع القيمة',
    enum: PromotionValueType,
    example: PromotionValueType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(PromotionValueType, {
    message: 'نوع القيمة يجب أن يكون percentage أو fixed',
  })
  valueType?: PromotionValueType;

  @ApiPropertyOptional({ description: 'معرف المنتج' })
  @IsOptional()
  @IsMongoId({ message: 'معرف المنتج غير صحيح' })
  product?: string;

  @ApiPropertyOptional({ description: 'معرف المتجر' })
  @IsOptional()
  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store?: string;

  @ApiPropertyOptional({ description: 'معرف الفئة' })
  @IsOptional()
  @IsMongoId({ message: 'معرف الفئة غير صحيح' })
  category?: string;

  @ApiProperty({
    description: 'المواضع',
    enum: PromotionPlacement,
    isArray: true,
    example: [PromotionPlacement.HOME_HERO],
  })
  @IsArray({ message: 'المواضع يجب أن تكون مصفوفة' })
  @IsEnum(PromotionPlacement, { each: true, message: 'الموضع غير صحيح' })
  placements: PromotionPlacement[];

  @ApiPropertyOptional({ description: 'المدن', example: ['صنعاء', 'عدن'] })
  @IsOptional()
  @IsArray({ message: 'المدن يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  cities?: string[];

  @ApiPropertyOptional({ description: 'القنوات', example: ['app', 'web'] })
  @IsOptional()
  @IsArray({ message: 'القنوات يجب أن تكون مصفوفة' })
  @IsEnum(['app', 'web'], { each: true })
  channels?: string[];

  @ApiPropertyOptional({
    description: 'قاعدة التكديس',
    enum: StackingRule,
    example: StackingRule.BEST,
  })
  @IsOptional()
  @IsEnum(StackingRule, {
    message: 'قاعدة التكديس غير صحيحة',
  })
  stacking?: StackingRule;

  @ApiPropertyOptional({ description: 'الحد الأدنى للكمية', example: 2 })
  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى للكمية يجب أن يكون رقماً' })
  @Min(1)
  minQty?: number;

  @ApiPropertyOptional({ description: 'الحد الأدنى لقيمة الطلب', example: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى لقيمة الطلب يجب أن يكون رقماً' })
  @Min(0)
  minOrderSubtotal?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى للخصم', example: 50 })
  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للخصم يجب أن يكون رقماً' })
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'الترتيب', example: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  order?: number;

  @ApiProperty({ description: 'تاريخ البداية', example: '2025-01-01' })
  @IsDateString({}, { message: 'تاريخ البداية غير صحيح' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'تاريخ النهاية', example: '2025-12-31' })
  @IsDateString({}, { message: 'تاريخ النهاية غير صحيح' })
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'حالة النشاط', example: true, default: true })
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون true أو false' })
  isActive: boolean;
}

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(
    [
      'home_hero',
      'home_strip',
      'category_header',
      'category_feed',
      'store_header',
      'search_banner',
      'cart',
      'checkout',
    ],
    { each: true },
  )
  placements?: string[];

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class GetPromotionsByPlacementDto {
  @IsEnum(
    [
      'home_hero',
      'home_strip',
      'category_header',
      'category_feed',
      'store_header',
      'search_banner',
      'cart',
      'checkout',
    ],
    { message: 'الموضع غير صحيح' },
  )
  placement: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['app', 'web'])
  channel?: string;
}
