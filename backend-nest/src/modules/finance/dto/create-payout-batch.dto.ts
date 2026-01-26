import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreatePayoutBatchDto {
  @IsEnum(['bank_transfer', 'wallet', 'cash', 'check'], {
    message: 'طريقة الدفع غير صحيحة',
  })
  paymentMethod: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الدفع المجدول غير صحيح' })
  scheduledFor?: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}

export class ApprovePayoutBatchDto {
  @IsString({ message: 'مرجع البنك مطلوب' })
  bankReference: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}
