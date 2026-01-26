import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExportReportDto {
  @ApiProperty()
  @IsString()
  type: string; // 'users', 'drivers', 'orders', 'vendors', 'financial'

  @ApiProperty()
  @IsString()
  format: string; // 'csv', 'excel', 'pdf'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class ExportReportResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  content: string | Buffer;

  @ApiProperty()
  contentType: string;
}

export class ExportAllDataResponseDto {
  success: boolean;
  url: string;
}

export class ImportDataDto {
  data: any; // TODO: Define import data structure

  @IsString()
  type: string;
}

export class ImportDataResponseDto {
  success: boolean;
  imported: number;
}
