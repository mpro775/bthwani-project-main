import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export default class UpdateKenzCategoryDto {
  @ApiProperty({ description: 'الاسم بالعربية', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameAr?: string;

  @ApiProperty({ description: 'الاسم بالإنجليزية', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameEn?: string;

  @ApiProperty({ description: 'المعرف الفريد (slug)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiProperty({ description: 'معرف الفئة الأب', required: false })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiProperty({ description: 'ترتيب العرض', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}
