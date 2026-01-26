import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Payroll extends Document {
  @Prop({ required: true, unique: true })
  payrollNumber: string; // رقم كشف الراتب (PR-2025-10)

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employee: Types.ObjectId;

  @Prop({ required: true })
  month: number; // الشهر (1-12)

  @Prop({ required: true })
  year: number; // السنة

  @Prop({ required: true })
  baseSalary: number; // الراتب الأساسي

  @Prop({ default: 0 })
  allowances: number; // البدلات

  @Prop({ default: 0 })
  bonuses: number; // المكافآت

  @Prop({ default: 0 })
  overtimePay: number; // أجر الساعات الإضافية

  @Prop({ default: 0 })
  deductions: number; // الخصومات

  @Prop({ required: true })
  netSalary: number; // الراتب الصافي

  @Prop({ required: true })
  workingDays: number; // أيام العمل الفعلية

  @Prop({ default: 0 })
  absentDays: number; // أيام الغياب

  @Prop({ default: 0 })
  lateDays: number; // أيام التأخير

  @Prop({ default: 0 })
  overtimeHours: number; // ساعات إضافية

  @Prop({
    required: true,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop()
  paymentMethod?: string; // طريقة الدفع

  @Prop()
  transactionRef?: string; // مرجع التحويل البنكي

  @Prop({ type: Object })
  breakdown?: {
    transportAllowance?: number;
    housingAllowance?: number;
    mealAllowance?: number;
    taxDeduction?: number;
    socialInsurance?: number;
    loanDeduction?: number;
    other?: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop()
  notes?: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);

// Compound Indexes
PayrollSchema.index({ payrollNumber: 1 }, { unique: true });
PayrollSchema.index({ employee: 1, year: -1, month: -1 });
PayrollSchema.index({ status: 1, createdAt: -1 });
PayrollSchema.index({ year: 1, month: 1 });
