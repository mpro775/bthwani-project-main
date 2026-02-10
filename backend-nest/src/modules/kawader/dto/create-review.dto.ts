import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export default class CreateReviewDto {
  @ApiProperty({
    description: 'التقييم من 1 إلى 5 نجوم',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @Type(() => Number)
  @IsInt({ message: 'التقييم يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'التقييم من 1 إلى 5' })
  @Max(5, { message: 'التقييم من 1 إلى 5' })
  rating: number;

  @ApiProperty({
    description: 'تعليق اختياري على الخدمة أو التعامل',
    required: false,
    example: 'تعامل ممتاز وإنجاز في الوقت المحدد',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'التعليق لا يتجاوز 1000 حرف' })
  comment?: string;
}
