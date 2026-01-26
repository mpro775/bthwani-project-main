import { IsString, IsOptional, IsArray } from 'class-validator';

export class GetAdminUsersResponseDto {
  data: any[]; // TODO: Create AdminUser DTO
}

export class CreateAdminUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

export class CreateAdminUserResponseDto {
  success: boolean;
  message: string;
}

export class UpdateAdminUserDto {
  @IsString()
  userId: string;

  updates: any; // TODO: Create specific update DTO
}

export class UpdateAdminUserResponseDto {
  success: boolean;
  message: string;
}

export class ResetAdminPasswordResponseDto {
  success: boolean;
  tempPassword: string;
}
