import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsObject, IsIn } from 'class-validator';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default class CreateDonorDto {
  @ApiProperty({ description: 'فصيلة الدم', example: 'O+', enum: BLOOD_TYPES })
  @IsString()
  @IsIn(BLOOD_TYPES)
  bloodType: string;

  @ApiPropertyOptional({ description: 'تاريخ آخر تبرع (ISO)' })
  @IsOptional()
  @IsDateString()
  lastDonation?: string;

  @ApiPropertyOptional({ description: 'متاح للتبرع الآن', default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({ description: 'المدينة أو المحافظة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'المحافظة' })
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional({
    description: 'الموقع',
    example: { lat: 24.7136, lng: 46.6753, address: 'الرياض' },
  })
  @IsOptional()
  @IsObject()
  location?: { lat: number; lng: number; address?: string };
}
