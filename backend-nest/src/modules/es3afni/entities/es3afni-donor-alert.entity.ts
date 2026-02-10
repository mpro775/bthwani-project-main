import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Es3afniDonorAlert extends Document {
  @ApiProperty({ description: 'معرف طلب الدم', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'Es3afni', required: true })
  requestId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المتبرع (المستخدم)', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  donorId: Types.ObjectId;

  @ApiProperty({ description: 'تم تسليم الإشعار', default: false })
  @Prop({ default: false })
  delivered: boolean;

  @ApiProperty({ description: 'وقت الإرسال' })
  @Prop({ type: Date, default: Date.now })
  sentAt: Date;

  @ApiProperty({ description: 'وقت القراءة', required: false })
  @Prop({ type: Date })
  readAt?: Date;
}

export const Es3afniDonorAlertSchema =
  SchemaFactory.createForClass(Es3afniDonorAlert);

Es3afniDonorAlertSchema.index({ requestId: 1, donorId: 1 }, { unique: true });
Es3afniDonorAlertSchema.index({ donorId: 1, sentAt: -1 });
