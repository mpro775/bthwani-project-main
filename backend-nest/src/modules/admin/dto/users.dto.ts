import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class GetUsersResponseDto {
  data: any[]; // TODO: Create User DTO
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserDetailsDto {
  user: any; // TODO: Create User DTO
  orderStats: {
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
  };
}

export class BanUserDto {
  @IsString()
  userId: string;

  @IsString()
  reason: string;

  @IsString()
  adminId: string;
}
