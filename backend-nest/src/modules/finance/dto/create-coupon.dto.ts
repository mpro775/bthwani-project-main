import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
  Min,
  // Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinancialCouponDto {
  @ApiProperty({ description: 'كود الكوبون', example: 'SAVE10' })
  @IsString({ message: 'كود الكوبون مطلوب' })
  @Length(3, 20, { message: 'كود الكوبون يجب أن يكون بين 3 و 20 حرف' })
  code: string;

  @ApiProperty({ description: 'الوصف', example: 'خصم 10% على جميع الطلبات' })
  @IsString({ message: 'الوصف مطلوب' })
  description: string;

  @ApiProperty({
    description: 'نوع الخصم',
    enum: ['percentage', 'fixed'],
    example: 'percentage',
  })
  @IsEnum(['percentage', 'fixed'], {
    message: 'نوع الخصم يجب أن يكون نسبة أو مبلغ ثابت',
  })
  discountType: string;

  @ApiProperty({ description: 'قيمة الخصم', example: 10 })
  @IsNumber({}, { message: 'قيمة الخصم يجب أن تكون رقماً' })
  @Min(0, { message: 'قيمة الخصم يجب أن تكون موجبة' })
  discountValue: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى للخصم', example: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للخصم يجب أن يكون رقماً' })
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'الحد الأدنى لقيمة الطلب', example: 50 })
  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى لقيمة الطلب يجب أن يكون رقماً' })
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ description: 'الحد الأقصى للاستخدام', example: 100 })
  @IsNumber({}, { message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للاستخدام يجب أن يكون 1 على الأقل' })
  maxUsage: number;

  @ApiProperty({
    description: 'الحد الأقصى للاستخدام لكل مستخدم',
    example: 1,
    default: 1,
  })
  @IsNumber(
    {},
    { message: 'الحد الأقصى للاستخدام لكل مستخدم يجب أن يكون رقماً' },
  )
  @Min(1)
  maxUsagePerUser: number;

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

  @IsOptional()
  @IsArray({ message: 'المدن المسموحة يجب أن تكون مصفوفة' })
  @IsString({ each: true, message: 'كل مدينة يجب أن تكون نصاً' })
  allowedCities?: string[];

  @IsOptional()
  @IsArray({ message: 'القنوات المسموحة يجب أن تكون مصفوفة' })
  @IsEnum(['app', 'web'], {
    each: true,
    message: 'القنوات يجب أن تكون app أو web',
  })
  allowedChannels?: string[];

  @IsOptional()
  @IsEnum(['all', 'first_order', 'specific_category', 'specific_store'], {
    message: 'نطاق التطبيق غير صحيح',
  })
  applicableTo?: string;

  @IsOptional()
  @IsString({ message: 'الفئة المستهدفة يجب أن تكون نصاً' })
  targetCategory?: string;

  @IsOptional()
  @IsString({ message: 'المتجر المستهدف يجب أن يكون نصاً' })
  targetStore?: string;
}

export class UpdateFinancialCouponDto {
  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة النشاط يجب أن تكون true أو false' })
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صحيح' })
  endDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً' })
  @Min(1)
  maxUsage?: number;
}

export class ValidateCouponDto {
  @IsString({ message: 'كود الكوبون مطلوب' })
  code: string;

  @IsNumber({}, { message: 'قيمة الطلب مطلوبة' })
  @Min(0)
  orderAmount: number;

  @IsOptional()
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  city?: string;

  @IsOptional()
  @IsEnum(['app', 'web'], { message: 'القناة يجب أن تكون app أو web' })
  channel?: string;
}
