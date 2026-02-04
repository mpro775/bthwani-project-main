import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';

export class CreateOnboardingDto {
  @ApiProperty({ example: 'متجر النور' })
  @IsString()
  @MinLength(1)
  storeName: string;

  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  @MinLength(1)
  ownerName: string;

  @ApiProperty({ example: '771234567' })
  @IsString()
  @MinLength(1)
  phone: string;

  @ApiPropertyOptional({ example: 'owner@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ type: AddressDto, description: 'يجب أن يحتوي على location على الأقل' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: {
    street?: string;
    city?: string;
    district?: string;
    location: { lat: number; lng: number };
  };

  @ApiProperty({ enum: ['store', 'vendor', 'driver'] })
  @IsEnum(['store', 'vendor', 'driver'])
  type: 'store' | 'vendor' | 'driver';

  @ApiPropertyOptional({ description: 'معرف الفئة' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'رابط صورة' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
