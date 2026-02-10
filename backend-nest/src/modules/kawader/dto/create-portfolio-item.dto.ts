import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsMongoId, ArrayMaxSize, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export default class CreatePortfolioItemDto {
  @ApiProperty({
    description: 'معرفات الوسائط (صور أو فيديو) — يمكن أن تكون مصفوفة فارغة',
    example: ['507f1f77bcf86cd799439011'],
    type: [String],
    maxItems: 10,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'الحد الأقصى 10 وسائط لكل عنصر' })
  @IsMongoId({ each: true, message: 'كل عنصر يجب أن يكون معرف وسيط صالح' })
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  mediaIds?: string[];

  @ApiProperty({
    description: 'وصف أو تعليق على عنصر المعرض',
    required: false,
    example: 'مشروع تصميم شعار لشركة ناشئة',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'الوصف لا يتجاوز 500 حرف' })
  caption?: string;
}
