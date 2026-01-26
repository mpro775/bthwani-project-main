import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  @Prop({ required: true, unique: true })
  requestNumber: string; // رقم الطلب (LR-2025-001)

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employee: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['annual', 'sick', 'unpaid', 'maternity', 'emergency'],
  })
  leaveType: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  days: number; // عدد الأيام

  @Prop({ required: true })
  reason: string; // السبب

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  notes?: string;

  @Prop({ type: [String] })
  attachments?: string[]; // مرفقات (شهادات مرضية، إلخ)
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);

// Indexes
LeaveRequestSchema.index({ requestNumber: 1 }, { unique: true });
LeaveRequestSchema.index({ employee: 1, status: 1 });
LeaveRequestSchema.index({ status: 1, createdAt: -1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });
