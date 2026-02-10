import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum Es3afniConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Schema({ timestamps: true, collection: 'es3afni_conversations' })
export class Es3afniConversation extends Document {
  @ApiProperty({ description: 'معرف طلب الدم (اسعفني)', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'Es3afni', required: true, index: true })
  requestId: Types.ObjectId;

  @ApiProperty({ description: 'صاحب الطلب (مطلوب الدم)', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requesterId: Types.ObjectId;

  @ApiProperty({ description: 'المتبرع (من يقدم التبرع)', example: '507f1f77bcf86cd799439012' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  donorId: Types.ObjectId;

  @ApiProperty({ description: 'آخر رسالة', required: false })
  @Prop({ type: String })
  lastMessage?: string;

  @ApiProperty({ description: 'تاريخ آخر رسالة', required: false })
  @Prop({ type: Date })
  lastMessageAt?: Date;

  @ApiProperty({ description: 'عدد الرسائل غير المقروءة لصاحب الطلب', default: 0 })
  @Prop({ type: Number, default: 0 })
  unreadCountRequester: number;

  @ApiProperty({ description: 'عدد الرسائل غير المقروءة للمتبرع', default: 0 })
  @Prop({ type: Number, default: 0 })
  unreadCountDonor: number;

  @ApiProperty({
    description: 'حالة المحادثة (active حتى 48 ساعة ثم closed تلقائياً)',
    enum: Es3afniConversationStatus,
    default: Es3afniConversationStatus.ACTIVE,
  })
  @Prop({
    type: String,
    enum: Es3afniConversationStatus,
    default: Es3afniConversationStatus.ACTIVE,
    index: true,
  })
  status: Es3afniConversationStatus;

  @ApiProperty({ description: 'وقت إغلاق المحادثة (48 ساعة من الإنشاء)', required: false })
  @Prop({ type: Date })
  closesAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const Es3afniConversationSchema =
  SchemaFactory.createForClass(Es3afniConversation);

Es3afniConversationSchema.index(
  { requestId: 1, requesterId: 1, donorId: 1 },
  { unique: true },
);
Es3afniConversationSchema.index({
  requesterId: 1,
  status: 1,
  lastMessageAt: -1,
});
Es3afniConversationSchema.index({
  donorId: 1,
  status: 1,
  lastMessageAt: -1,
});
Es3afniConversationSchema.index({ lastMessageAt: -1 });
Es3afniConversationSchema.index({ status: 1, createdAt: 1 });
