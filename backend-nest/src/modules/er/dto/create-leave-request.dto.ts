import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: 'نوع الإجازة',
    enum: ['annual', 'sick', 'unpaid', 'maternity', 'emergency'],
    example: 'annual',
  })
  @IsNotEmpty()
  @IsEnum(['annual', 'sick', 'unpaid', 'maternity', 'emergency'])
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'emergency';

  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2025-01-15',
  })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2025-01-20',
  })
  @IsNotEmpty()
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'سبب الإجازة',
    example: 'إجازة سنوية',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'ملاحظات إضافية',
    example: 'سأكون متاح عبر الهاتف',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'مرفقات (روابط URL)',
    example: ['https://example.com/medical-certificate.pdf'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachments?: string[];
}
