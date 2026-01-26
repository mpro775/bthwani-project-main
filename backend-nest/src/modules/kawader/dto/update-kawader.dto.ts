import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsEnum } from 'class-validator';
import { KawaderStatus } from './create-kawader.dto';

export default class UpdateKawaderDto {
  @ApiProperty({ description: 'عنوان العرض الوظيفي', required: false, example: 'مطور Full Stack محدث' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'تفاصيل العرض', required: false, example: 'تفاصيل محدثة للمتطلبات' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نطاق العمل', required: false, example: 'مشروع 8 أشهر' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiProperty({ description: 'الميزانية المتاحة', required: false, example: 18000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { experience: '5+ years', skills: ['React', 'Node.js', 'TypeScript'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'حالة العرض', required: false, enum: KawaderStatus, example: KawaderStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(KawaderStatus)
  status?: KawaderStatus;
}
