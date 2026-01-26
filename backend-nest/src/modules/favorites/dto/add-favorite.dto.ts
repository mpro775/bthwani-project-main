import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FavoriteType {
  PRODUCT = 'product',
  RESTAURANT = 'restaurant',
}

class FavoriteSnapshotDto {
  @ApiPropertyOptional({ description: 'عنوان العنصر' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'صورة العنصر' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'السعر' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'التقييم' })
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'معرف المتجر' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'نوع المتجر', enum: ['grocery', 'restaurant'] })
  @IsOptional()
  @IsEnum(['grocery', 'restaurant'])
  storeType?: 'grocery' | 'restaurant';
}

export class AddFavoriteDto {
  @ApiProperty({ description: 'معرف العنصر', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'نوع العنصر',
    enum: FavoriteType,
    example: FavoriteType.PRODUCT,
  })
  @IsEnum(FavoriteType)
  @IsNotEmpty()
  itemType: FavoriteType;

  @ApiPropertyOptional({
    description: 'نسخة من بيانات العنصر وقت الإضافة',
    type: FavoriteSnapshotDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FavoriteSnapshotDto)
  itemSnapshot?: FavoriteSnapshotDto;
}
