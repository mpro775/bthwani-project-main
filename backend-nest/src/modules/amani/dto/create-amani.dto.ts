import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum AmaniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class CreateAmaniDto {
  @ApiProperty({
    description: 'معرف المستخدم صاحب الطلب',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: 'عنوان الطلب',
    example: 'نقل عائلي من الرياض إلى جدة',
    type: 'string'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'وصف تفصيلي للطلب',
    example: 'نقل عائلي مكون من 4 أفراد مع أمتعة',
    required: false,
    type: 'string'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'موقع الانطلاق',
    example: { lat: 24.7136, lng: 46.6753, address: 'الرياض، المملكة العربية السعودية' },
    required: false,
    type: Object
  })
  @IsOptional()
  @IsObject()
  origin?: any;

  @ApiProperty({
    description: 'الوجهة المطلوبة',
    example: { lat: 21.4858, lng: 39.1925, address: 'جدة، المملكة العربية السعودية' },
    required: false,
    type: Object
  })
  @IsOptional()
  @IsObject()
  destination?: any;

  @ApiProperty({
    description: 'بيانات إضافية للطلب',
    example: { passengers: 4, luggage: true, specialRequests: 'كرسي أطفال' },
    required: false,
    type: Object
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'حالة الطلب',
    enum: AmaniStatus,
    default: AmaniStatus.DRAFT,
    required: false
  })
  @IsOptional()
  @IsEnum(AmaniStatus)
  status?: AmaniStatus;
}
