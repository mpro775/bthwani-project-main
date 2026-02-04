import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Schema({ timestamps: true, collection: 'arabonbookings' })
export class Booking extends Document {
  @ApiProperty({ description: 'معرف المستخدم الحاجز', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'معرف العربون/العرض', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'Arabon', required: true, index: true })
  arabonId: Types.ObjectId;

  @ApiProperty({ description: 'معرف الـ slot المحجوز', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'BookingSlot', required: true })
  slotId: Types.ObjectId;

  @ApiProperty({
    description: 'حالة الحجز',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  @Prop({ type: String, enum: Object.values(BookingStatus), default: BookingStatus.CONFIRMED, index: true })
  status: BookingStatus;

  @ApiProperty({ description: 'معرف معاملة المحفظة (حجز المبلغ)', required: false })
  @Prop()
  walletTxId?: string;

  @ApiProperty({ description: 'مبلغ العربون المحجوز', example: 100 })
  @Prop({ required: true, type: Number })
  depositAmount: number;

  @ApiProperty({ description: 'بيانات إضافية', required: false })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ arabonId: 1, createdAt: -1 });
