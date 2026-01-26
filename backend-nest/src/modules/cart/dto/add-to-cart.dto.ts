import {
  IsString,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsEnum(['merchantProduct', 'deliveryProduct', 'restaurantProduct'], {
    message: 'نوع المنتج غير صحيح',
  })
  productType: string;

  @IsMongoId({ message: 'معرف المنتج غير صحيح' })
  productId: string;

  @IsString({ message: 'اسم المنتج مطلوب' })
  name: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون موجباً' })
  price: number;

  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;

  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store: string;

  @IsOptional()
  @IsString({ message: 'الصورة يجب أن تكون نصاً' })
  image?: string;

  @IsOptional()
  @IsObject({ message: 'الخيارات يجب أن تكون كائن' })
  options?: Record<string, any>;
}

export class UpdateCartItemDto {
  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  quantity: number;
}

export class AddNoteDto {
  @IsString({ message: 'الملاحظة يجب أن تكون نصاً' })
  note: string;
}

export class AddDeliveryAddressDto {
  @IsString({ message: 'الشارع مطلوب' })
  street: string;

  @IsString({ message: 'المدينة مطلوبة' })
  city: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsObject()
  location?: { lat: number; lng: number };
}
