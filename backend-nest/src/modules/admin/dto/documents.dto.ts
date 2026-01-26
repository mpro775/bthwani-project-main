import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class GetDriverDocumentsResponseDto {
  documents: any[]; // TODO: Create Document DTO
}

export class VerifyDocumentDto {
  @IsString()
  driverId: string;

  @IsString()
  docId: string;

  @IsBoolean()
  verified: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class VerifyDocumentResponseDto {
  success: boolean;
  message: string;
}

export class UpdateDocumentDto {
  @IsString()
  driverId: string;

  @IsString()
  docId: string;

  updates: any; // TODO: Create specific update DTO

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateDocumentResponseDto {
  success: boolean;
  message: string;
}
