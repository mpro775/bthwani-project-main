import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export default class CreateKenzCategoryDto {
  @ApiProperty({ description: 'الاسم بالعربية', example: 'إلكترونيات' })
  @IsString()
  @MinLength(1)
  nameAr: string;

  @ApiProperty({ description: 'الاسم بالإنجليزية', example: 'Electronics' })
  @IsString()
  @MinLength(1)
  nameEn: string;

  @ApiProperty({ description: 'المعرف الفريد (slug)', example: 'electronics' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiProperty({ description: 'معرف الفئة الأب (للفئات الفرعية)', required: false })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiProperty({ description: 'ترتيب العرض', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
