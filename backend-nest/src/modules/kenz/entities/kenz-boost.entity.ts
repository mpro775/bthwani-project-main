import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KenzBoostType {
  HIGHLIGHT = 'highlight',
  PIN = 'pin',
  TOP = 'top',
}

export enum KenzBoostStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'kenz_boosts' })
export class KenzBoost extends Document {
  @ApiProperty({ description: 'معرف إعلان كنز' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;

  @ApiProperty({ description: 'تاريخ بداية الترويج' })
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty({ description: 'تاريخ نهاية الترويج' })
  @Prop({ type: Date, required: true, index: true })
  endDate: Date;

  @ApiProperty({ description: 'نوع الترويج', enum: KenzBoostType })
  @Prop({ type: String, enum: KenzBoostType, default: KenzBoostType.HIGHLIGHT })
  boostType: KenzBoostType;

  @ApiProperty({ description: 'معرف من أنشأ الترويج (أدمن)' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: Types.ObjectId;

  @ApiProperty({ description: 'حالة الترويج', enum: KenzBoostStatus })
  @Prop({ type: String, enum: KenzBoostStatus, default: KenzBoostStatus.ACTIVE, index: true })
  status: KenzBoostStatus;
}

export const KenzBoostSchema = SchemaFactory.createForClass(KenzBoost);
KenzBoostSchema.index({ endDate: 1, status: 1 });
