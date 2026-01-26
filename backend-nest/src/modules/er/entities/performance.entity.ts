import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PerformanceReview extends Document {
  @Prop({ required: true, unique: true })
  reviewNumber: string; // رقم التقييم (REV-2025-001)

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employee: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  reviewer: Types.ObjectId; // المقيّم

  @Prop({ required: true })
  reviewPeriod: string; // فترة التقييم (Q1-2025, 2025, إلخ)

  @Prop({ required: true })
  reviewDate: Date;

  @Prop({ required: true, min: 1, max: 5 })
  overallRating: number; // التقييم الإجمالي (1-5)

  @Prop({ type: Object })
  ratings?: {
    technicalSkills?: number;
    communication?: number;
    teamwork?: number;
    productivity?: number;
    reliability?: number;
    initiative?: number;
  };

  @Prop()
  strengths?: string; // نقاط القوة

  @Prop()
  weaknesses?: string; // نقاط الضعف

  @Prop()
  recommendations?: string; // التوصيات

  @Prop({
    required: true,
    enum: ['draft', 'submitted', 'approved', 'acknowledged'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Date })
  acknowledgedAt?: Date; // تاريخ اطلاع الموظف

  @Prop()
  employeeComments?: string; // تعليقات الموظف

  @Prop()
  goals?: string[]; // الأهداف القادمة
}

export const PerformanceReviewSchema =
  SchemaFactory.createForClass(PerformanceReview);

// Indexes
PerformanceReviewSchema.index({ reviewNumber: 1 }, { unique: true });
PerformanceReviewSchema.index({ employee: 1, reviewDate: -1 });
PerformanceReviewSchema.index({ reviewer: 1 });
PerformanceReviewSchema.index({ status: 1 });
