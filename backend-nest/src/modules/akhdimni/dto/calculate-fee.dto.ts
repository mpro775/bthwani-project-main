import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ example: 15.369445, description: 'خط العرض' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 44.191006, description: 'خط الطول' })
  @IsNumber()
  lng: number;
}

class PointDto {
  @ApiProperty({ description: 'موقع النقطة', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ required: false, description: 'المدينة' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false, description: 'الشارع' })
  @IsString()
  @IsOptional()
  street?: string;
}

export class CalculateFeeDto {
  @ApiProperty({
    enum: ['docs', 'parcel', 'groceries', 'carton', 'food', 'fragile', 'other'],
    description: 'نوع الغرض',
    example: 'parcel',
  })
  @IsEnum(['docs', 'parcel', 'groceries', 'carton', 'food', 'fragile', 'other'])
  category: string;

  @ApiProperty({
    enum: ['small', 'medium', 'large'],
    description: 'حجم الغرض',
    example: 'medium',
  })
  @IsEnum(['small', 'medium', 'large'])
  size: string;

  @ApiProperty({ required: false, description: 'الوزن بالكيلوجرام', example: 2.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weightKg?: number;

  @ApiProperty({ description: 'نقطة الاستلام', type: PointDto })
  @ValidateNested()
  @Type(() => PointDto)
  pickup: PointDto;

  @ApiProperty({ description: 'نقطة التسليم', type: PointDto })
  @ValidateNested()
  @Type(() => PointDto)
  dropoff: PointDto;

  @ApiProperty({ required: false, description: 'البقشيش', example: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  tip?: number;
}

export interface FeeCalculationResult {
  distanceKm: number;
  deliveryFee: number;
  totalWithTip: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    sizeFee: number;
    weightFee: number;
    tip: number;
  };
}

