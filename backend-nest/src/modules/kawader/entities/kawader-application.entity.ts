import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KawaderApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, collection: 'kawader_applications' })
export class KawaderApplication extends Document {
  @ApiProperty({ description: 'معرف العرض الوظيفي' })
  @Prop({ type: Types.ObjectId, ref: 'Kawader', required: true, index: true })
  kawaderId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المتقدم' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'رسالة التقديم (اختيارية)' })
  @Prop({ type: String, default: '' })
  coverNote?: string;

  @ApiProperty({ description: 'حالة التقديم', enum: KawaderApplicationStatus, default: KawaderApplicationStatus.PENDING })
  @Prop({ type: String, enum: KawaderApplicationStatus, default: KawaderApplicationStatus.PENDING, index: true })
  status: KawaderApplicationStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KawaderApplicationSchema = SchemaFactory.createForClass(KawaderApplication);

KawaderApplicationSchema.index({ kawaderId: 1, userId: 1 }, { unique: true });
