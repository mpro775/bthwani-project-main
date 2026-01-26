import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetUserWalletHistoryResponseDto {
  data: any[]; // TODO: Create Wallet transaction DTO
  balance: number;
}

export class GetUserOrdersHistoryResponseDto {
  data: any[]; // TODO: Create Order DTO
  total: number;
}

export class AdjustUserWalletDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['credit', 'debit'])
  type: 'credit' | 'debit';

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AdjustUserWalletResponseDto {
  success: boolean;
  message: string;
}
