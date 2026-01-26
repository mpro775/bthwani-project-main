import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentType, PaymentMethod, PaymentsListResponse, PaymentsStats, PaymentsAdminQuery, PaymentsStatusUpdateDto } from '../interfaces/admin.interfaces';
import { Types } from 'mongoose';

export class PaymentsAdminQueryDto implements PaymentsAdminQuery {
  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ required: false, enum: PaymentType })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiProperty({ required: false, enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  ownerId?: Types.ObjectId;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountMin?: number;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountMax?: number;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  createdAfter?: Date;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  createdBefore?: Date;

  @ApiProperty({ required: false, example: 'دفع فاتورة' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'TXN-12345' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class PaymentsStatusUpdateAdminDto implements PaymentsStatusUpdateDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ required: false, example: 'تم تأكيد الدفع من قبل الإدارة' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: 'TXN-123456789' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class PaymentsListResponseDto implements PaymentsListResponse {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: any[];

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439012' })
  nextCursor?: string;
}

export class PaymentsStatsDto implements PaymentsStats {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1500000 })
  totalAmount: number;

  @ApiProperty({ example: 15 })
  pending: number;

  @ApiProperty({ example: 8 })
  processing: number;

  @ApiProperty({ example: 120 })
  completed: number;

  @ApiProperty({ example: 5 })
  failed: number;

  @ApiProperty({ example: 2 })
  cancelled: number;

  @ApiProperty({ example: 0 })
  refunded: number;

  @ApiProperty({ example: 80 })
  deposits: number;

  @ApiProperty({ example: 45 })
  withdrawals: number;

  @ApiProperty({ example: 15 })
  transfers: number;

  @ApiProperty({ example: 8 })
  payments: number;

  @ApiProperty({ example: 2 })
  refunds: number;

  @ApiProperty({ example: 0 })
  commissions: number;
}

export class PaymentsAdminActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'تم تحديث حالة الدفع بنجاح' })
  message: string;

  @ApiProperty({ required: false })
  data?: any;
}