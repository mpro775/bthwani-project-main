import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kawader_messages' })
export class KawaderMessage extends Document {
  @ApiProperty({ description: 'معرف المحادثة', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'KawaderConversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المرسل', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @ApiProperty({ description: 'نص الرسالة', example: 'مرحباً، هل العرض الوظيفي متاح؟' })
  @Prop({ type: String, required: true })
  text: string;

  @ApiProperty({ description: 'تاريخ القراءة', required: false })
  @Prop({ type: Date })
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KawaderMessageSchema = SchemaFactory.createForClass(KawaderMessage);

// Indexes for performance
KawaderMessageSchema.index({ conversationId: 1, createdAt: -1 });
KawaderMessageSchema.index({ senderId: 1, createdAt: -1 });
KawaderMessageSchema.index({ conversationId: 1, readAt: 1 });
