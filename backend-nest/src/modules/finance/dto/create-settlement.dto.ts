import {
  IsString,
  IsMongoId,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';

export class CreateSettlementDto {
  @IsMongoId({ message: 'معرف الكيان غير صحيح' })
  entity: string;

  @IsEnum(['Vendor', 'Driver', 'Marketer'], {
    message: 'نوع الكيان غير صحيح',
  })
  entityModel: string;

  @IsDateString({}, { message: 'تاريخ بداية الفترة غير صحيح' })
  periodStart: string;

  @IsDateString({}, { message: 'تاريخ نهاية الفترة غير صحيح' })
  periodEnd: string;

  @IsOptional()
  @IsArray({ message: 'قائمة الطلبات يجب أن تكون مصفوفة' })
  @IsMongoId({ each: true, message: 'معرفات الطلبات غير صحيحة' })
  orders?: string[];

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}

export class ApproveSettlementDto {
  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}

export class SettlementBreakdownDto {
  @IsOptional()
  @IsNumber({}, { message: 'رسوم التوصيل يجب أن تكون رقماً' })
  @Min(0)
  deliveryFees?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الإكراميات يجب أن تكون رقماً' })
  @Min(0)
  tips?: number;

  @IsOptional()
  @IsNumber({}, { message: 'المكافآت يجب أن تكون رقماً' })
  bonuses?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الغرامات يجب أن تكون رقماً' })
  penalties?: number;

  @IsOptional()
  @IsNumber({}, { message: 'التعديلات يجب أن تكون رقماً' })
  adjustments?: number;
}
