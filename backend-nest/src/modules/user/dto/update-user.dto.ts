import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'الاسم الكامل' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'الاسم المستعار' })
  @IsOptional()
  @IsString()
  aliasName?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'صورة الملف الشخصي' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'اللغة', enum: ['ar', 'en'] })
  @IsOptional()
  @IsEnum(['ar', 'en'])
  language?: string;

  @ApiPropertyOptional({ description: 'الثيم', enum: ['light', 'dark'] })
  @IsOptional()
  @IsEnum(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional({ description: 'توكن الإشعارات' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
