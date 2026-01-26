import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsMongoId,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommissionDto {
  @ApiProperty({
    description: 'معرف الكيان (طلب، بائع، سائق، مسوق)',
    example: '60f1b2b3c4d5e6f7g8h9i0j1',
  })
  @IsMongoId({ message: 'معرف الكيان غير صحيح' })
  entityId: string;

  @ApiProperty({
    description: 'نوع الكيان',
    enum: ['Order', 'Vendor', 'Driver', 'Marketer'],
    example: 'Order',
  })
  @IsEnum(['Order', 'Vendor', 'Driver', 'Marketer'], {
    message: 'نوع الكيان غير صحيح',
  })
  entityModel: string;

  @ApiProperty({
    description: 'معرف المستفيد',
    example: '60f1b2b3c4d5e6f7g8h9i0j2',
  })
  @IsMongoId({ message: 'معرف المستفيد غير صحيح' })
  beneficiary: string;

  @ApiProperty({
    description: 'نوع المستفيد',
    enum: ['driver', 'vendor', 'marketer', 'company'],
    example: 'driver',
  })
  @IsEnum(['driver', 'vendor', 'marketer', 'company'], {
    message: 'نوع المستفيد غير صحيح',
  })
  beneficiaryType: string;

  @ApiProperty({
    description: 'مبلغ العمولة',
    example: 50,
  })
  @IsNumber({}, { message: 'المبلغ يجب أن يكون رقماً' })
  @Min(0, { message: 'المبلغ يجب أن يكون موجباً' })
  amount: number;

  @ApiProperty({
    description: 'نسبة العمولة (مثلاً 10 = 10%)',
    example: 10,
  })
  @IsNumber({}, { message: 'النسبة يجب أن تكون رقماً' })
  @Min(0, { message: 'النسبة يجب أن تكون موجبة' })
  rate: number;

  @ApiProperty({
    description: 'المبلغ الأساسي الذي حُسبت منه العمولة',
    example: 500,
  })
  @IsNumber({}, { message: 'المبلغ الأساسي يجب أن يكون رقماً' })
  @Min(0, { message: 'المبلغ الأساسي يجب أن يكون موجباً' })
  baseAmount: number;

  @ApiProperty({
    description: 'نوع الحساب',
    enum: ['percentage', 'fixed'],
    example: 'percentage',
  })
  @IsEnum(['percentage', 'fixed'], {
    message: 'نوع الحساب يجب أن يكون نسبة أو مبلغ ثابت',
  })
  calculationType: string;

  @ApiPropertyOptional({
    description: 'البيانات الإضافية',
    example: { orderId: '123', orderType: 'delivery' },
  })
  @IsOptional()
  @IsObject({ message: 'البيانات الإضافية يجب أن تكون كائن' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'الملاحظات',
    example: 'عمولة توصيل طلب رقم 123',
  })
  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}
