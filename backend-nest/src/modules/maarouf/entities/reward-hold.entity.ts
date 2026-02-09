import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum RewardHoldStatus {
  PENDING = 'pending',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class RewardHold extends Document {
  @ApiProperty({
    description: 'صاحب الإعلان (الذي يضع المكافأة)',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  founderId: Types.ObjectId;

  @ApiProperty({
    description: 'صاحب المطالبة بالمكافأة (من وجد المفقود)',
    type: String,
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  claimerId?: Types.ObjectId;

  @ApiProperty({
    description: 'إعلان معروف المرتبط بالمكافأة',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: 'Maarouf', required: true })
  maaroufId: Types.ObjectId;

  @ApiProperty({
    description: 'قيمة المكافأة المحجوزة',
    example: 100,
  })
  @Prop({ type: Number, required: true })
  amount: number;

  @ApiProperty({
    description: 'حالة الحجز',
    enum: RewardHoldStatus,
    default: RewardHoldStatus.PENDING,
  })
  @Prop({
    type: String,
    enum: RewardHoldStatus,
    default: RewardHoldStatus.PENDING,
  })
  status: RewardHoldStatus;

  @ApiProperty({
    description: 'معرف معاملة المحفظة المرتبطة بالحجز (إن وُجد)',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  walletTxId?: Types.ObjectId;

  @ApiProperty({
    description: 'رمز استلام (OTP / PIN) للتحقق عند التسليم',
    required: false,
    example: '4829',
  })
  @Prop({ type: String })
  deliveryCode?: string;
}

export const RewardHoldSchema = SchemaFactory.createForClass(RewardHold);

RewardHoldSchema.index({ maaroufId: 1, founderId: 1, status: 1 });

