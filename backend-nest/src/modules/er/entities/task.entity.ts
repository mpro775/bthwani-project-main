import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedBy?: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Prop({
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  estimatedHours?: number;

  @Prop()
  actualHours?: number;

  @Prop()
  notes?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Indexes
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ priority: 1 });
