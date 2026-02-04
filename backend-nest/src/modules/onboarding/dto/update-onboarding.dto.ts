import { IsString, IsOptional, IsEnum, IsObject, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOnboardingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  storeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  ownerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'عنوان مع location على الأقل',
    example: { street: '', city: '', location: { lat: 15.3694, lng: 44.191 } },
  })
  @IsOptional()
  @IsObject()
  address?: {
    street?: string;
    city?: string;
    district?: string;
    location?: { lat: number; lng: number };
  };

  @ApiPropertyOptional({ enum: ['store', 'vendor', 'driver'] })
  @IsOptional()
  @IsEnum(['store', 'vendor', 'driver'])
  type?: 'store' | 'vendor' | 'driver';
}
