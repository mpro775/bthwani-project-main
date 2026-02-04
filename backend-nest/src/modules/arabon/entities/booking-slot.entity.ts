import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class BookingSlot extends Document {
  @ApiProperty({
    description: 'معرف العربون/العرض',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'Arabon', required: true, index: true })
  arabonId: Types.ObjectId;

  @ApiProperty({
    description: 'تاريخ ووقت بداية الـ slot',
    example: '2025-06-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @Prop({ required: true, type: Date, index: true })
  datetime: Date;

  @ApiProperty({
    description: 'هل الـ slot محجوز',
    example: false,
  })
  @Prop({ default: false })
  isBooked: boolean;

  @ApiProperty({
    description: 'مدة الـ slot بالدقائق (اختياري)',
    example: 60,
    required: false,
  })
  @Prop({ default: 60 })
  durationMinutes?: number;

  @ApiProperty({
    description: 'معرف المستخدم الذي حجز الـ slot (عند الحجز)',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  bookedBy?: Types.ObjectId;
}

export const BookingSlotSchema = SchemaFactory.createForClass(BookingSlot);
BookingSlotSchema.index({ arabonId: 1, datetime: 1 });
