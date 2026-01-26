import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetQualityReviewsQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class GetQualityReviewsResponseDto {
  data: any[]; // TODO: Create QualityReview DTO
  total: number;
}

export class CreateQualityReviewDto {
  @IsString()
  type: string;

  @IsString()
  targetId: string; // driver or store id

  @IsNumber()
  rating: number;

  @IsString()
  review: string;

  @IsOptional()
  recommendations?: string[];
}

export class CreateQualityReviewResponseDto {
  success: boolean;
  message: string;
  review: CreateQualityReviewDto;
}

export class GetQualityMetricsQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetQualityMetricsResponseDto {
  orderRating: number;
  driverRating: number;
}
