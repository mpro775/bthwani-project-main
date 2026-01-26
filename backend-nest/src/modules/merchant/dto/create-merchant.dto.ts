import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
  IsMongoId,
} from 'class-validator';

export class CreateMerchantDto {
  @IsString({ message: 'الاسم مطلوب' })
  name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email: string;

  @IsOptional()
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  phone?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId({ message: 'معرف التاجر غير صحيح' })
  vendor?: string;

  @IsOptional()
  @IsMongoId({ message: 'معرف المتجر غير صحيح' })
  store?: string;

  @IsOptional()
  @IsArray({ message: 'فئات العمل يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  businessCategories?: string[];

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    location?: { lat: number; lng: number };
  };

  @IsOptional()
  @IsObject()
  businessHours?: {
    openTime: string;
    closeTime: string;
    daysOff?: string[];
  };
}

export class UpdateMerchantDto {
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
  @IsObject()
  businessHours?: {
    openTime: string;
    closeTime: string;
    daysOff?: string[];
  };
}
