import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KenzReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
  ACTION_TAKEN = 'action_taken',
}

@Schema({ timestamps: true, collection: 'kenz_reports' })
export class KenzReport extends Document {
  @ApiProperty({ description: 'معرف الإعلان المُبلَغ عنه' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المستخدم المبلّغ' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  reporterId: Types.ObjectId;

  @ApiProperty({ description: 'سبب الإبلاغ', example: 'محتوى غير لائق' })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({ description: 'ملاحظات إضافية', required: false })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'حالة البلاغ', enum: KenzReportStatus })
  @Prop({ type: String, enum: KenzReportStatus, default: KenzReportStatus.PENDING, index: true })
  status: KenzReportStatus;
}

export const KenzReportSchema = SchemaFactory.createForClass(KenzReport);
KenzReportSchema.index({ kenzId: 1, reporterId: 1 }, { unique: true });
