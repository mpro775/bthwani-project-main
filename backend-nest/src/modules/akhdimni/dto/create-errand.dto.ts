import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ErrandPointDto {
  @IsString({ message: 'التسمية مطلوبة' })
  label: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsObject({ message: 'الموقع مطلوب' })
  location: { lat: number; lng: number };
}

export class CreateErrandDto {
  @IsEnum(['docs', 'parcel', 'groceries', 'other'], {
    message: 'الفئة يجب أن تكون docs أو parcel أو groceries أو other',
  })
  category: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsEnum(['small', 'medium', 'large'], {
    message: 'الحجم يجب أن يكون small أو medium أو large',
  })
  size?: string;

  @IsOptional()
  @IsNumber({}, { message: 'الوزن يجب أن يكون رقماً' })
  @Min(0)
  weightKg?: number;

  @ValidateNested()
  @Type(() => ErrandPointDto)
  pickup: ErrandPointDto;

  @ValidateNested()
  @Type(() => ErrandPointDto)
  dropoff: ErrandPointDto;

  @IsOptional()
  @IsArray({ message: 'نقاط الطريق يجب أن تكون مصفوفة' })
  waypoints?: Array<{
    label?: string;
    location: { lat: number; lng: number };
  }>;

  @IsOptional()
  @IsNumber({}, { message: 'الإكرامية يجب أن تكون رقماً' })
  @Min(0)
  tip?: number;

  @IsEnum(['wallet', 'cash', 'card', 'mixed'], {
    message: 'طريقة الدفع غير صحيحة',
  })
  paymentMethod: string;

  @IsOptional()
  @IsDateString({}, { message: 'الوقت المجدول غير صحيح' })
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateErrandStatusDto {
  @IsEnum(
    [
      'created',
      'assigned',
      'driver_enroute_pickup',
      'picked_up',
      'driver_enroute_dropoff',
      'delivered',
      'cancelled',
    ],
    { message: 'الحالة غير صحيحة' },
  )
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AssignDriverDto {
  @IsString({ message: 'معرف السائق مطلوب' })
  driverId: string;
}

export class RateErrandDto {
  @IsNumber({}, { message: 'تقييم السائق يجب أن يكون رقماً' })
  @Min(1)
  driver: number;

  @IsNumber({}, { message: 'تقييم الخدمة يجب أن يكون رقماً' })
  @Min(1)
  service: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
