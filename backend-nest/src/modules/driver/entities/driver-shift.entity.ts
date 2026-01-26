import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ShiftAssignment {
  driverId: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface BreakTime {
  start: string;
  end: string;
  duration: number; // minutes
}

@Schema({ timestamps: true, collection: 'driver_shifts' })
export class DriverShift extends Document {
  @Prop({ required: true, type: String })
  name: string; // e.g., "Morning Shift", "Night Shift"

  @Prop({ required: true, type: String })
  startTime: string; // "08:00"

  @Prop({ required: true, type: String })
  endTime: string; // "16:00"

  @Prop({ type: [Number], default: [0, 1, 2, 3, 4, 5, 6] })
  days: number[]; // 0=Sunday, 1=Monday, etc.

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({
    type: [
      {
        driverId: { type: Types.ObjectId, ref: 'Driver' },
        startDate: Date,
        endDate: Date,
        isActive: Boolean,
      },
    ],
    default: [],
  })
  assignments: ShiftAssignment[];

  @Prop({
    type: {
      start: String,
      end: String,
      duration: Number,
    },
  })
  breakTimes?: BreakTime;

  @Prop({ type: Number })
  maxDrivers?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  color?: string; // للعرض في التقويم

  createdAt?: Date;
  updatedAt?: Date;
}

export const DriverShiftSchema = SchemaFactory.createForClass(DriverShift);

// Indexes
DriverShiftSchema.index({ isActive: 1 });
DriverShiftSchema.index({ 'assignments.driverId': 1 });
DriverShiftSchema.index({ createdAt: -1 });

