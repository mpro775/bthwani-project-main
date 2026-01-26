import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';

export class CreateAttributeDto {
  @IsString({ message: 'الاسم مطلوب' })
  name: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsEnum(['text', 'number', 'select', 'multiselect', 'color', 'boolean'], {
    message: 'نوع الخاصية غير صحيح',
  })
  type: string;

  @IsOptional()
  @IsArray({ message: 'الخيارات يجب أن تكون مصفوفة' })
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsObject()
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  order?: number;
}
