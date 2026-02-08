import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { AmaniStatus } from './create-amani.dto';

export default class UpdateAmaniDto {
  @ApiProperty({
    description: 'عنوان الطلب',
    example: 'نقل عائلي محدث من الرياض إلى جدة',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'وصف تفصيلي للطلب',
    example: 'نقل عائلي مكون من 4 أفراد مع أمتعة وكرسي أطفال',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'موقع الانطلاق المحدث',
    example: {
      lat: 24.7136,
      lng: 46.6753,
      address: 'الرياض، المملكة العربية السعودية',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  origin?: any;

  @ApiProperty({
    description: 'الوجهة المحدثة',
    example: {
      lat: 21.4858,
      lng: 39.1925,
      address: 'جدة، المملكة العربية السعودية',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  destination?: any;

  @ApiProperty({
    description: 'البيانات الإضافية المحدثة (womenOnly: سائقة أنثى فقط)',
    example: {
      passengers: 4,
      luggage: true,
      specialRequests: 'كرسي أطفال، مساعدات إضافية',
      womenOnly: false,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'حالة الطلب المحدثة',
    enum: AmaniStatus,
    example: AmaniStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AmaniStatus)
  status?: AmaniStatus;
}
