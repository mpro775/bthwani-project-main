import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true, unique: true })
  employeeId: string; // معرف الموظف (EMP-001)

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  nationalId?: string; // رقم الهوية الوطنية

  @Prop({ required: true })
  position: string; // المنصب

  @Prop({ required: true })
  department: string; // القسم

  @Prop({
    required: true,
    enum: ['full_time', 'part_time', 'contract', 'intern'],
    default: 'full_time',
  })
  employmentType: string;

  @Prop({ required: true })
  salary: number; // الراتب الأساسي

  @Prop({ required: true })
  hireDate: Date; // تاريخ التعيين

  @Prop()
  terminationDate?: Date; // تاريخ إنهاء الخدمة

  @Prop({
    required: true,
    enum: ['active', 'on_leave', 'suspended', 'terminated'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Object })
  address?: {
    street: string;
    city: string;
    country?: string;
  };

  @Prop()
  emergencyContact?: string; // جهة الاتصال للطوارئ

  @Prop()
  emergencyPhone?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  manager?: Types.ObjectId; // المدير المباشر

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop({ type: Object })
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
  };

  @Prop({ default: 0 })
  annualLeaveDays?: number; // أيام الإجازة السنوية

  @Prop({ default: 0 })
  sickLeaveDays?: number; // أيام الإجازة المرضية

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes
EmployeeSchema.index({ employeeId: 1 }, { unique: true });
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ department: 1, status: 1 });
EmployeeSchema.index({ manager: 1 });
EmployeeSchema.index({ status: 1 });
