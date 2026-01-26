import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateReconciliationDto {
  @IsDateString({}, { message: 'تاريخ البداية غير صحيح' })
  startDate: string;

  @IsDateString({}, { message: 'تاريخ النهاية غير صحيح' })
  endDate: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'custom'], {
    message: 'نوع الفترة غير صحيح',
  })
  periodType: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}

export class AddActualTotalsDto {
  @IsNumber({}, { message: 'إجمالي الإيداعات يجب أن يكون رقماً' })
  totalDeposits: number;

  @IsNumber({}, { message: 'إجمالي السحوبات يجب أن يكون رقماً' })
  totalWithdrawals: number;

  @IsNumber({}, { message: 'إجمالي الرسوم يجب أن يكون رقماً' })
  totalFees: number;
}

export class AddIssueDto {
  @IsEnum(['missing_transaction', 'amount_mismatch', 'duplicate', 'other'], {
    message: 'نوع المشكلة غير صحيح',
  })
  type: 'missing_transaction' | 'amount_mismatch' | 'duplicate' | 'other';

  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description: string;

  @IsOptional()
  @IsNumber({}, { message: 'المبلغ المتوقع يجب أن يكون رقماً' })
  expectedAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'المبلغ الفعلي يجب أن يكون رقماً' })
  actualAmount?: number;

  @IsOptional()
  @IsString({ message: 'مرجع المعاملة يجب أن يكون نصاً' })
  transactionRef?: string;
}

export class ResolveIssueDto {
  @IsString({ message: 'الحل يجب أن يكون نصاً' })
  resolution: string;
}
