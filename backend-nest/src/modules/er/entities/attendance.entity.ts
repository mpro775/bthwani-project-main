import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employee: Types.ObjectId;

  @Prop({ required: true })
  date: Date; // التاريخ

  @Prop({ required: true })
  checkIn: Date; // وقت الحضور

  @Prop()
  checkOut?: Date; // وقت الانصراف

  @Prop({
    required: true,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
    default: 'present',
  })
  status: string;

  @Prop()
  workHours?: number; // ساعات العمل الفعلية

  @Prop({ default: 0 })
  overtimeHours?: number; // ساعات إضافية

  @Prop({ type: Object })
  location?: {
    checkInLocation?: { lat: number; lng: number };
    checkOutLocation?: { lat: number; lng: number };
  };

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  approvedBy?: Types.ObjectId; // من وافق (للتعديلات)

  @Prop({ default: false })
  isManualEntry: boolean; // إدخال يدوي أم تلقائي
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Compound Indexes
AttendanceSchema.index({ employee: 1, date: -1 });
AttendanceSchema.index({ date: -1 });
AttendanceSchema.index({ status: 1, date: -1 });
