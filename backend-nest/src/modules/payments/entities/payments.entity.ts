import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  COMMISSION = 'commission'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  DIGITAL = 'digital'
}

@Schema({ timestamps: true })
export class Payments extends Document {
  @ApiProperty({ description: 'معرف المالك', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان الدفع', example: 'دفع فاتورة خدمة' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'وصف الدفع', required: false, example: 'دفع شهري لخدمة الإعلانات' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'نوع الدفع', enum: PaymentType, example: PaymentType.PAYMENT })
  @Prop({ enum: PaymentType, default: PaymentType.PAYMENT })
  type: PaymentType;

  @ApiProperty({ description: 'المبلغ', example: 500 })
  @Prop({ required: true, type: Number })
  amount: number;

  @ApiProperty({ description: 'العملة', example: 'SAR' })
  @Prop({ default: 'SAR' })
  currency: string;

  @ApiProperty({ description: 'طريقة الدفع', enum: PaymentMethod, example: PaymentMethod.CARD })
  @Prop({ enum: PaymentMethod, default: PaymentMethod.WALLET })
  method: PaymentMethod;

  @ApiProperty({ description: 'حالة الدفع', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'رقم المرجع', required: false, example: 'TXN-12345' })
  @Prop()
  reference?: string;

  @ApiProperty({ description: 'رقم المعاملة', required: false, example: 'TXN-67890' })
  @Prop()
  transactionId?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { service: 'advertising', period: 'monthly' } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'تاريخ المعالجة', required: false })
  @Prop()
  processedAt?: Date;

  @ApiProperty({ description: 'تاريخ الإكمال', required: false })
  @Prop()
  completedAt?: Date;
}

export const PaymentsSchema = SchemaFactory.createForClass(Payments);
