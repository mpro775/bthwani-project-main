import { IsString } from 'class-validator';

export class GetPendingStoresResponseDto {
  data: any[]; // TODO: Create Store DTO
  total: number;
}

export class ModerateStoreDto {
  @IsString()
  reason: string;

  @IsString()
  adminId: string;
}

export class ModerateStoreResponseDto {
  success: boolean;
  message: string;
}
