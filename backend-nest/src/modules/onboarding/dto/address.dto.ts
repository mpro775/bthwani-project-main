import { IsOptional, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @ApiPropertyOptional({ example: 15.3694 })
  @IsNumber()
  lat: number;

  @ApiPropertyOptional({ example: 44.191 })
  @IsNumber()
  lng: number;
}

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: { lat: number; lng: number };
}
