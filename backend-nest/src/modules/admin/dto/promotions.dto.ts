import { IsString } from 'class-validator';

export class GetActivePromotionsResponseDto {
  data: any[]; // TODO: Create Promotion DTO
}

export class PausePromotionDto {
  @IsString()
  promotionId: string;
}

export class PausePromotionResponseDto {
  success: boolean;
  message: string;
}

export class ResumePromotionDto {
  @IsString()
  promotionId: string;
}

export class ResumePromotionResponseDto {
  success: boolean;
  message: string;
}
