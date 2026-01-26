import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class AddToSheinCartDto {
  @IsString({ message: 'معرف المنتج من Shein مطلوب' })
  sheinProductId: string;

  @IsString({ message: 'اسم المنتج مطلوب' })
  name: string;

  @IsNumber({}, { message: 'السعر بالدولار يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون موجباً' })
  price: number;

  @IsNumber({}, { message: 'السعر بالريال يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون موجباً' })
  priceYER: number;

  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'الصورة يجب أن تكون نصاً' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'الحجم يجب أن يكون نصاً' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'اللون يجب أن يكون نصاً' })
  color?: string;

  @IsOptional()
  @IsObject({ message: 'الخصائص يجب أن تكون كائن' })
  attributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  shippingTime?: string;

  @IsOptional()
  @IsNumber({}, { message: 'تكلفة الشحن يجب أن تكون رقماً' })
  @Min(0)
  shippingCost?: number;
}

export class UpdateSheinCartItemDto {
  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;
}

export class UpdateSheinShippingDto {
  @IsNumber({}, { message: 'الشحن الدولي يجب أن يكون رقماً' })
  @Min(0)
  internationalShipping: number;

  @IsNumber({}, { message: 'الشحن المحلي يجب أن يكون رقماً' })
  @Min(0)
  localShipping: number;

  @IsNumber({}, { message: 'رسوم الخدمة يجب أن تكون رقماً' })
  @Min(0)
  serviceFee: number;

  @IsOptional()
  @IsNumber({}, { message: 'سعر الصرف يجب أن يكون رقماً' })
  @Min(0)
  exchangeRate?: number;
}
