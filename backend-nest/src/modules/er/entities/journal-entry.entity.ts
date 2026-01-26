import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class JournalLine {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ChartOfAccounts' })
  account: Types.ObjectId;

  @Prop({ required: true })
  debit: number; // المبلغ المدين

  @Prop({ required: true })
  credit: number; // المبلغ الدائن

  @Prop()
  description?: string;
}

const JournalLineSchema = SchemaFactory.createForClass(JournalLine);

@Schema({ timestamps: true })
export class JournalEntry extends Document {
  @Prop({ required: true, unique: true })
  entryNumber: string; // رقم القيد (JE-2025-001)

  @Prop({ required: true })
  date: Date; // تاريخ القيد

  @Prop({ required: true })
  description: string; // وصف القيد

  @Prop({ type: [JournalLineSchema], required: true })
  lines: JournalLine[]; // سطور القيد

  @Prop({ required: true })
  totalDebit: number; // إجمالي المدين

  @Prop({ required: true })
  totalCredit: number; // إجمالي الدائن

  @Prop({
    required: true,
    enum: ['draft', 'posted', 'reversed'],
    default: 'draft',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['general', 'sales', 'purchase', 'payment', 'receipt', 'adjustment'],
    default: 'general',
  })
  type: string;

  @Prop()
  reference?: string; // مرجع خارجي (رقم فاتورة، إلخ)

  @Prop({ type: Types.ObjectId })
  relatedEntity?: Types.ObjectId; // ربط بكيان (Order, Invoice, إلخ)

  @Prop()
  relatedEntityModel?: string;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  postedBy?: Types.ObjectId;

  @Prop({ type: Date })
  postedAt?: Date;

  @Prop()
  notes?: string;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);

// Indexes
JournalEntrySchema.index({ entryNumber: 1 }, { unique: true });
JournalEntrySchema.index({ date: -1 });
JournalEntrySchema.index({ status: 1 });
JournalEntrySchema.index({ type: 1 });
JournalEntrySchema.index({ relatedEntity: 1, relatedEntityModel: 1 });

// Validation: التأكد من توازن القيد
JournalEntrySchema.pre('save', function (next) {
  const totalDebit = this.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = this.lines.reduce((sum, line) => sum + line.credit, 0);

  this.totalDebit = totalDebit;
  this.totalCredit = totalCredit;

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return next(new Error('القيد غير متوازن - المدين والدائن يجب أن يتساويا'));
  }

  next();
});
