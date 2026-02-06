import { IsString, IsOptional, IsEnum, IsObject, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuickOnboardDto {
  @ApiProperty({ example: '771234567' })
  @IsString()
  @MinLength(1)
  phone: string;

  @ApiProperty({ example: 'متجر النور' })
  @IsString()
  @MinLength(1)
  storeName: string;

  @ApiProperty({ example: { lat: 15.3694, lng: 44.191 } })
  @IsObject()
  location: { lat: number; lng: number };

  @ApiPropertyOptional({ example: 'أحمد محمد' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ enum: ['store', 'vendor', 'driver'] })
  @IsOptional()
  @IsEnum(['store', 'vendor', 'driver'])
  type?: 'store' | 'vendor' | 'driver';
}
