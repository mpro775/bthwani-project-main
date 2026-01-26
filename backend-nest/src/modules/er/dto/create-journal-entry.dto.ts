import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalLineDto {
  @ApiProperty({
    description: 'معرف الحساب',
    example: '60f1b2b3c4d5e6f7g8h9i0j1',
  })
  @IsNotEmpty()
  @IsMongoId()
  account: string;

  @ApiProperty({
    description: 'المبلغ المدين',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debit: number;

  @ApiProperty({
    description: 'المبلغ الدائن',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  credit: number;

  @ApiPropertyOptional({
    description: 'وصف السطر',
    example: 'دفع نقدي',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({
    description: 'تاريخ القيد',
    example: '2025-01-15',
  })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'وصف القيد',
    example: 'قيد بيع بضائع',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'سطور القيد',
    type: [JournalLineDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];

  @ApiProperty({
    description: 'نوع القيد',
    enum: ['general', 'sales', 'purchase', 'payment', 'receipt', 'adjustment'],
    example: 'sales',
  })
  @IsNotEmpty()
  @IsEnum(['general', 'sales', 'purchase', 'payment', 'receipt', 'adjustment'])
  type: 'general' | 'sales' | 'purchase' | 'payment' | 'receipt' | 'adjustment';

  @ApiPropertyOptional({
    description: 'المرجع الخارجي',
    example: 'INV-2025-001',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'الكيان المرتبط',
    example: '60f1b2b3c4d5e6f7g8h9i0j1',
  })
  @IsOptional()
  @IsMongoId()
  relatedEntity?: string;

  @ApiPropertyOptional({
    description: 'نوع الكيان المرتبط',
    example: 'Order',
  })
  @IsOptional()
  @IsString()
  relatedEntityModel?: string;

  @ApiPropertyOptional({
    description: 'ملاحظات إضافية',
    example: 'قيد تم إنشاؤه تلقائياً من نظام المبيعات',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
