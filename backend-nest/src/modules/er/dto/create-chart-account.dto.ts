import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChartAccountDto {
  @ApiProperty({
    description: 'رمز الحساب',
    example: '1001',
  })
  @IsNotEmpty()
  @IsString()
  accountCode: string;

  @ApiProperty({
    description: 'اسم الحساب',
    example: 'Cash Account',
  })
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @ApiPropertyOptional({
    description: 'الاسم بالعربية',
    example: 'حساب النقدية',
  })
  @IsOptional()
  @IsString()
  accountNameAr?: string;

  @ApiProperty({
    description: 'نوع الحساب',
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    example: 'asset',
  })
  @IsNotEmpty()
  @IsEnum(['asset', 'liability', 'equity', 'revenue', 'expense'])
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

  @ApiProperty({
    description: 'الطبيعة الطبيعية للحساب',
    enum: ['debit', 'credit'],
    example: 'debit',
  })
  @IsNotEmpty()
  @IsEnum(['debit', 'credit'])
  normalBalance: 'debit' | 'credit';

  @ApiPropertyOptional({
    description: 'الحساب الأب',
    example: '60f1b2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsMongoId()
  parent?: string;

  @ApiPropertyOptional({
    description: 'وصف الحساب',
    example: 'حساب للنقدية في الخزنة',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
