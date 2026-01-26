import { IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiPropertyOptional({ description: 'حالة النشاط' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'توكن الإشعارات' })
  @IsOptional()
  expoPushToken?: string;

  @ApiPropertyOptional({ description: 'إعدادات الإشعارات' })
  @IsOptional()
  @IsObject()
  notificationSettings?: {
    enabled?: boolean;
    orderAlerts?: boolean;
    financialAlerts?: boolean;
    marketingAlerts?: boolean;
    systemUpdates?: boolean;
  };
}
