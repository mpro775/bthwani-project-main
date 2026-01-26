import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({ required: false })
  _id?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: Object })
  permissions: Record<string, boolean>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [String] })
  users: string[];

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export class GetRolesResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [RoleDto] })
  data: RoleDto[];

  @ApiProperty()
  count: number;
}

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;
}

export class CreateRoleResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: RoleDto })
  data: RoleDto;
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoleResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: RoleDto, required: false })
  data?: RoleDto;
}

export class GetRoleByIdResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: RoleDto })
  data: RoleDto;
}
