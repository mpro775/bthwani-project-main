import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum, IsArray, Min, IsIn } from 'class-validator';

export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateKenzDto {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011' })
  @IsString()
  ownerId: string;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'السعر', required: false, example: 3500 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'الفئة (نص حر)', required: false, example: 'إلكترونيات' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'معرف الفئة من شجرة الفئات', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'فضي', storage: '256GB' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', required: false, enum: KenzStatus, default: KenzStatus.DRAFT })
  @IsOptional()
  @IsEnum(KenzStatus)
  status?: KenzStatus;

  @ApiProperty({ description: 'روابط صور CDN (Bunny)', required: false, example: ['https://cdn.bthwani.com/kenz/1-img.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'المدينة (من الـ 22 محافظة يمنية)', required: false, example: 'صنعاء' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'حالة السلعة', required: false, enum: ['new', 'used', 'refurbished'] })
  @IsOptional()
  @IsIn(['new', 'used', 'refurbished'])
  condition?: 'new' | 'used' | 'refurbished';

  @ApiProperty({ description: 'كلمات مفتاحية', required: false, example: ['جوال', 'أيفون'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({ description: 'العملة', required: false, example: 'ريال يمني', default: 'ريال يمني' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'الكمية', required: false, example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'رقم هاتف من نُشر الإعلان بالنيابة عنه', required: false, example: '771234567' })
  @IsOptional()
  @IsString()
  postedOnBehalfOfPhone?: string;

  @ApiProperty({ description: 'معرف المستخدم الذي نُشر الإعلان بالنيابة عنه', required: false })
  @IsOptional()
  @IsString()
  postedOnBehalfOfUserId?: string | null;

  @ApiProperty({ description: 'طريقة التسليم: meetup, delivery, both', required: false, enum: ['meetup', 'delivery', 'both'] })
  @IsOptional()
  @IsIn(['meetup', 'delivery', 'both'])
  deliveryOption?: 'meetup' | 'delivery' | 'both';

  @ApiProperty({ description: 'رسوم التوصيل (عند خيار توصيل)', required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;
}
