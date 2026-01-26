import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kenz_messages' })
export class KenzMessage extends Document {
  @ApiProperty({ description: 'معرف المحادثة', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'KenzConversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المرسل', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @ApiProperty({ description: 'نص الرسالة', example: 'مرحباً، هل المنتج متوفر؟' })
  @Prop({ type: String, required: true })
  text: string;

  @ApiProperty({ description: 'تاريخ القراءة', required: false })
  @Prop({ type: Date })
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KenzMessageSchema = SchemaFactory.createForClass(KenzMessage);

// Indexes for performance
KenzMessageSchema.index({ conversationId: 1, createdAt: -1 });
KenzMessageSchema.index({ senderId: 1, createdAt: -1 });
KenzMessageSchema.index({ conversationId: 1, readAt: 1 });
