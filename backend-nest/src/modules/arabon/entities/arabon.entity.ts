import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum ArabonStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Arabon extends Document {
  @ApiProperty({ description: 'معرف صاحب العربون', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان العربون', example: 'عربون لحجز عرض سياحي' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'وصف إضافي', required: false, example: 'تفاصيل الحجز' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'قيمة العربون', required: false, example: 250.5 })
  @Prop()
  depositAmount?: number;

  @ApiProperty({ description: 'موعد التنفيذ/الجدولة', required: false, example: '2025-06-01T10:00:00.000Z', type: 'string', format: 'date-time' })
  @Prop()
  scheduleAt?: Date;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { guests: 2 } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة العربون', enum: ArabonStatus, default: ArabonStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: ArabonStatus;
}

export const ArabonSchema = SchemaFactory.createForClass(Arabon);
