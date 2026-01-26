import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ description: 'الاسم الكامل' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'البريد الإلكتروني' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'كلمة المرور' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'الدور',
    enum: ['rider_driver', 'light_driver', 'women_driver'],
  })
  @IsEnum(['rider_driver', 'light_driver', 'women_driver'])
  role: string;

  @ApiProperty({ description: 'نوع المركبة', enum: ['motor', 'bike', 'car'] })
  @IsEnum(['motor', 'bike', 'car'])
  vehicleType: string;

  @ApiPropertyOptional({
    description: 'فئة المركبة',
    enum: ['light', 'medium', 'heavy'],
  })
  @IsOptional()
  @IsEnum(['light', 'medium', 'heavy'])
  vehicleClass?: string;

  @ApiPropertyOptional({ description: 'قوة المركبة' })
  @IsOptional()
  @IsNumber()
  vehiclePower?: number;

  @ApiPropertyOptional({
    description: 'نوع السائق',
    enum: ['primary', 'joker'],
  })
  @IsOptional()
  @IsEnum(['primary', 'joker'])
  driverType?: string;

  @ApiPropertyOptional({ description: 'سائقة أنثى' })
  @IsOptional()
  @IsBoolean()
  isFemaleDriver?: boolean;
}
