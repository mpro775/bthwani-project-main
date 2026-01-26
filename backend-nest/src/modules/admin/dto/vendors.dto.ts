import { IsString } from 'class-validator';

export class GetPendingVendorsResponseDto {
  data: any[]; // TODO: Create Vendor DTO
  total: number;
}

export class ModerateVendorDto {
  @IsString()
  reason: string;

  @IsString()
  adminId: string;
}

export class ModerateVendorResponseDto {
  success: boolean;
  message: string;
}
