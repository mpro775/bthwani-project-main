import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WithdrawalRequest } from '../../finance/entities/withdrawal-request.entity';

export class GetWithdrawalsQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['Driver', 'Vendor', 'Marketer'] })
  @IsOptional()
  @IsEnum(['Driver', 'Vendor', 'Marketer'])
  userModel?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class WithdrawalDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['Driver', 'Vendor', 'Marketer'] })
  userModel: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'] })
  status: string;

  @ApiProperty()
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    iban?: string;
  };

  @ApiPropertyOptional()
  transactionRef?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  processedAt?: Date;
}

export class GetWithdrawalsResponseDto {
  @ApiProperty({ type: [WithdrawalDto] })
  data: WithdrawalRequest[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class GetPendingWithdrawalsResponseDto {
  @ApiProperty({ type: [WithdrawalDto] })
  data: WithdrawalRequest[];

  @ApiProperty()
  total: number;
}

export class ApproveWithdrawalDto {
  @ApiProperty()
  @IsString()
  withdrawalId: string;

  @ApiProperty()
  @IsString()
  adminId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectWithdrawalDto {
  @ApiProperty()
  @IsString()
  withdrawalId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsString()
  adminId: string;
}

export class ApproveWithdrawalResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  withdrawal: WithdrawalRequest;
}

export class RejectWithdrawalResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
