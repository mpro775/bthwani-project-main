import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendBulkNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class SendBulkNotificationResponseDto {
  success: boolean;
  message: string;
  recipients: number;
}
