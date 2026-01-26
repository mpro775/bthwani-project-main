import {
  IsNotEmpty,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationDto {
  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;
}

export class AddAddressDto {
  @ApiProperty({ description: 'تسمية العنوان (منزل، عمل، إلخ)' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'المدينة' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'الشارع' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ description: 'الموقع الجغرافي' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
