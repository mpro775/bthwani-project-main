import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChartOfAccounts extends Document {
  @Prop({ required: true, unique: true })
  accountCode: string; // رمز الحساب (1000, 1100, إلخ)

  @Prop({ required: true })
  accountName: string; // اسم الحساب

  @Prop()
  accountNameAr?: string; // الاسم بالعربية

  @Prop({
    required: true,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
  })
  accountType: string;

  @Prop({
    required: true,
    enum: ['debit', 'credit'],
  })
  normalBalance: string; // الطبيعة (مدين/دائن)

  @Prop({ type: Types.ObjectId, ref: 'ChartOfAccounts' })
  parent?: Types.ObjectId; // الحساب الأب

  @Prop({ default: 0 })
  level?: number; // مستوى التداخل

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  currentBalance: number; // الرصيد الحالي

  @Prop()
  description?: string;

  @Prop({ default: false })
  isSystem: boolean; // حساب نظامي (لا يمكن حذفه)
}

export const ChartOfAccountsSchema =
  SchemaFactory.createForClass(ChartOfAccounts);

// Indexes
ChartOfAccountsSchema.index({ accountCode: 1 }, { unique: true });
ChartOfAccountsSchema.index({ accountType: 1 });
ChartOfAccountsSchema.index({ parent: 1 });
ChartOfAccountsSchema.index({ isActive: 1 });
