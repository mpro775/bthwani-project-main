import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsString,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'نوع النموذج', enum: ['User', 'Driver'] })
  @IsEnum(['User', 'Driver'])
  userModel: string;

  @ApiProperty({ description: 'المبلغ', example: 100 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'نوع العملية', enum: ['credit', 'debit'] })
  @IsEnum(['credit', 'debit'])
  type: string;

  @ApiProperty({
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
  method: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'رقم مرجعي بنكي' })
  @IsOptional()
  @IsString()
  bankRef?: string;

  @ApiPropertyOptional({ description: 'بيانات إضافية' })
  @IsOptional()
  meta?: any;
}
