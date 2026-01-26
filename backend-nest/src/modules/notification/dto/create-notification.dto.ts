import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiPropertyOptional({ description: 'معرف المستخدم المستهدف' })
  @IsOptional()
  @IsString()
  toUser?: string;

  @ApiPropertyOptional({ description: 'الجمهور المستهدف', type: [String] })
  @IsOptional()
  @IsArray()
  audience?: string[];

  @ApiProperty({ description: 'العنوان' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'المحتوى' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ description: 'بيانات إضافية' })
  @IsOptional()
  data?: any;

  @ApiPropertyOptional({ description: 'معرف التجميع' })
  @IsOptional()
  @IsString()
  collapseId?: string;
}
