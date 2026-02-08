import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsMongoId,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionFilterDto {
  @ApiPropertyOptional({
    description: 'معرف المستخدم',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({
    description: 'نوع النموذج',
    enum: ['User', 'Driver'],
  })
  @IsOptional()
  @IsEnum(['User', 'Driver'])
  userModel?: string;

  @ApiPropertyOptional({
    description: 'نوع العملية',
    enum: ['credit', 'debit'],
  })
  @IsOptional()
  @IsEnum(['credit', 'debit'])
  type?: string;

  @ApiPropertyOptional({
    description: 'طريقة الدفع',
    enum: [
      'agent',
      'card',
      'transfer',
      'payment',
      'escrow',
      'reward',
      'kuraimi',
      'withdrawal',
    ],
  })
  @IsOptional()
  @IsEnum([
    'agent',
    'card',
    'transfer',
    'payment',
    'escrow',
    'reward',
    'kuraimi',
    'withdrawal',
  ])
  method?: string;

  @ApiPropertyOptional({
    description: 'حالة المعاملة',
    enum: ['pending', 'completed', 'failed', 'reversed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'reversed'])
  status?: string;

  @ApiPropertyOptional({
    description: 'الحد الأدنى للمبلغ',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'الحد الأقصى للمبلغ',
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'تاريخ البداية (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ النهاية (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'البحث في الوصف',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'معرف الطلب/الحجز (meta.orderId أو meta.refId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'نوع المرجع للحجوزات (booking_deposit, booking_refund, booking_complete)',
  })
  @IsOptional()
  @IsString()
  refType?: string;

  @ApiPropertyOptional({
    description: 'Cursor للصفحة التالية',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'عدد العناصر',
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
