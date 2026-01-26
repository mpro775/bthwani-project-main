import { IsOptional, IsString } from 'class-validator';

export class GetCouponUsageQueryDto {
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class GetCouponUsageResponseDto {
  totalUsage: number;
  uniqueUsers: number;
}

export class DeactivateCouponDto {
  @IsString()
  couponCode: string;
}

export class DeactivateCouponResponseDto {
  success: boolean;
  message: string;
}
