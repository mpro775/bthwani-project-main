import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true, collection: 'kenz_conversations' })
export class KenzConversation extends Document {
  @ApiProperty({ description: 'معرف الإعلان', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المعلن (صاحب الإعلان)', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المستخدم المهتم', example: '507f1f77bcf86cd799439012' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  interestedUserId: Types.ObjectId;

  @ApiProperty({ description: 'آخر رسالة', required: false })
  @Prop({ type: String })
  lastMessage?: string;

  @ApiProperty({ description: 'تاريخ آخر رسالة', required: false })
  @Prop({ type: Date })
  lastMessageAt?: Date;

  @ApiProperty({ description: 'عدد الرسائل غير المقروءة للمعلن', default: 0 })
  @Prop({ type: Number, default: 0 })
  unreadCountOwner: number;

  @ApiProperty({ description: 'عدد الرسائل غير المقروءة للمهتم', default: 0 })
  @Prop({ type: Number, default: 0 })
  unreadCountInterested: number;

  @ApiProperty({ description: 'حالة المحادثة', enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  @Prop({ 
    type: String, 
    enum: ConversationStatus, 
    default: ConversationStatus.ACTIVE,
    index: true 
  })
  status: ConversationStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KenzConversationSchema = SchemaFactory.createForClass(KenzConversation);

// Indexes for performance
KenzConversationSchema.index({ kenzId: 1, ownerId: 1, interestedUserId: 1 }, { unique: true });
KenzConversationSchema.index({ ownerId: 1, status: 1, lastMessageAt: -1 });
KenzConversationSchema.index({ interestedUserId: 1, status: 1, lastMessageAt: -1 });
KenzConversationSchema.index({ lastMessageAt: -1 });
