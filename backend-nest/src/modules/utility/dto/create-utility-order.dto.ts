import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UtilityKind {
  GAS = 'gas',
  WATER = 'water',
}

export enum UtilityPaymentMethod {
  CASH = 'cash',
  WALLET = 'wallet',
  CARD = 'card',
  MIXED = 'mixed',
}

class NoteDto {
  @IsString()
  body: string;

  @IsEnum(['public', 'internal'], { message: 'الرؤية يجب أن تكون public أو internal' })
  @IsOptional()
  visibility?: 'public' | 'internal';
}

export class CreateUtilityOrderDto {
  @IsEnum(UtilityKind, { message: 'النوع يجب أن يكون gas أو water' })
  kind: UtilityKind;

  @IsString({ message: 'المدينة مطلوبة' })
  city: string;

  @IsString({ message: 'المتغير مطلوب (حجم الأسطوانة أو حجم الوايت)' })
  variant: string; // "20L" للغاز أو "small|medium|large" للماء

  @IsNumber({}, { message: 'الكمية يجب أن تكون رقماً' })
  @Min(0.5)
  quantity: number; // للغاز: عدد صحيح، للماء: 0.5 (نصف) أو 1+

  @IsEnum(UtilityPaymentMethod, { message: 'طريقة الدفع غير صحيحة' })
  paymentMethod: UtilityPaymentMethod;

  @IsMongoId({ message: 'معرّف العنوان غير صحيح' })
  addressId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes?: NoteDto[];

  @IsOptional()
  @IsString()
  scheduledFor?: string; // ISO date string

  @IsOptional()
  @IsObject()
  customerLocation?: {
    lat: number;
    lng: number;
  };

  // الحقول التي ستُحسب تلقائياً من السيرفر (لا يرسلها المستخدم)
  // price, deliveryFee, total
}

