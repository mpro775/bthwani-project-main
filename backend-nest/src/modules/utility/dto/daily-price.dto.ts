import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDailyPriceDto {
  @IsEnum(['gas', 'water'], { message: 'النوع يجب أن يكون gas أو water' })
  kind: 'gas' | 'water';

  @IsString({ message: 'المدينة مطلوبة' })
  city: string;

  @IsString({ message: 'التاريخ مطلوب بصيغة YYYY-MM-DD' })
  date: string;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  variant?: string;
}

export class UpdateDailyPriceDto {
  @IsOptional()
  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0)
  price?: number;
}

