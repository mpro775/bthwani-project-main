import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsObject, Min } from 'class-validator';

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  WALLET_TRANSFER = 'wallet_transfer',
  CRYPTO = 'crypto',
}

export class BankDetailsDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  accountHolderName: string;
}

export class CryptoDetailsDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  network: string;

  @IsNotEmpty()
  @IsString()
  currency: string;
}

export class WalletDetailsDto {
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;
}

export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsEnum(WithdrawalMethod)
  method: WithdrawalMethod;

  @IsOptional()
  @IsObject()
  bankDetails?: BankDetailsDto;

  @IsOptional()
  @IsObject()
  cryptoDetails?: CryptoDetailsDto;

  @IsOptional()
  @IsObject()
  walletDetails?: WalletDetailsDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
