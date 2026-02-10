import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'es3afni_messages' })
export class Es3afniMessage extends Document {
  @ApiProperty({ description: 'معرف المحادثة', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'Es3afniConversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المرسل', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @ApiProperty({ description: 'نص الرسالة', example: 'أستطيع التبرع، متى يمكنني الحضور؟' })
  @Prop({ type: String, required: true })
  text: string;

  @ApiProperty({ description: 'تاريخ القراءة', required: false })
  @Prop({ type: Date })
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const Es3afniMessageSchema =
  SchemaFactory.createForClass(Es3afniMessage);

Es3afniMessageSchema.index({ conversationId: 1, createdAt: -1 });
Es3afniMessageSchema.index({ senderId: 1, createdAt: -1 });
