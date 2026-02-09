import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsNumber, Min, IsBoolean, IsDateString } from 'class-validator';

export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found'
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaaroufCategory {
  PHONE = 'phone',
  PET = 'pet',
  ID = 'id',
  WALLET = 'wallet',
  KEYS = 'keys',
  BAG = 'bag',
  OTHER = 'other',
}

export default class CreateMaaroufDto {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'محفظة سوداء مفقودة في منطقة النرجس' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع الإعلان', required: false, enum: MaaroufKind, example: MaaroufKind.LOST })
  @IsOptional()
  @IsEnum(MaaroufKind)
  kind?: MaaroufKind;

  @ApiProperty({ description: 'العلامات', required: false, type: [String], example: ['محفظة', 'بطاقات', 'نرجس'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: MaaroufStatus, default: MaaroufStatus.DRAFT })
  @IsOptional()
  @IsEnum(MaaroufStatus)
  status?: MaaroufStatus;

  @ApiProperty({ description: 'روابط الصور المرفقة', required: false, type: [String], example: ['https://example.com/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ description: 'التصنيف', required: false, enum: MaaroufCategory, example: MaaroufCategory.WALLET })
  @IsOptional()
  @IsEnum(MaaroufCategory)
  category?: MaaroufCategory;

  @ApiProperty({ description: 'مكافأة اختيارية (بالريال)', required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reward?: number;

  @ApiProperty({
    description: 'الموقع الجغرافي (GeoJSON)',
    required: false,
    example: { type: 'Point', coordinates: [44.2, 15.35] },
  })
  @IsOptional()
  @IsObject()
  location?: { type: 'Point'; coordinates: [number, number] };

  @ApiProperty({ description: 'خيار التوصيل', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  deliveryToggle?: boolean;

  @ApiProperty({ description: 'نشر بدون رقم هاتف', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({ description: 'تاريخ انتهاء الإعلان', required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
