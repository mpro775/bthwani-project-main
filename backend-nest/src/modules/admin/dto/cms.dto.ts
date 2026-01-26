import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetCMSPagesResponseDto {
  data: any[]; // TODO: Create CMS Page DTO
}

export class CreateCMSPageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class CreateCMSPageResponseDto {
  success: boolean;
  page: CreateCMSPageDto;
}

export class UpdateCMSPageDto {
  @IsString()
  pageId: string;

  updates: any; // TODO: Create specific update DTO
}

export class UpdateCMSPageResponseDto {
  success: boolean;
  message: string;
}
