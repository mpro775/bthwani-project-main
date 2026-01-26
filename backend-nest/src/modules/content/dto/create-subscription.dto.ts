import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Length,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString({ message: 'الكود مطلوب' })
  @Length(2, 20, { message: 'الكود يجب أن يكون بين 2 و 20 حرف' })
  code: string;

  @IsString({ message: 'الاسم مطلوب' })
  name: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون موجباً' })
  price: number;

  @IsEnum(['monthly', 'quarterly', 'yearly'], {
    message: 'دورة الفوترة غير صحيحة',
  })
  billingCycle: string;

  @IsOptional()
  @IsArray({ message: 'الميزات يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'نسبة الخصم يجب أن تكون رقماً' })
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}

export class SubscribeDto {
  @IsString({ message: 'كود الخطة مطلوب' })
  planCode: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
