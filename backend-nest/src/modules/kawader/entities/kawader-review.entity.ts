import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kawader_reviews' })
export class KawaderReview extends Document {
  @ApiProperty({ description: 'معرف العرض الوظيفي' })
  @Prop({ type: Types.ObjectId, ref: 'Kawader', required: true, index: true })
  kawaderId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المقيّم (من كتب المراجعة)' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  reviewerId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المُقيَّم (صاحب العرض / مقدم الخدمة)' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  revieweeId: Types.ObjectId;

  @ApiProperty({ description: 'التقييم من 1 إلى 5', minimum: 1, maximum: 5 })
  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @ApiProperty({ description: 'تعليق اختياري', required: false })
  @Prop({ type: String, default: '' })
  comment?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KawaderReviewSchema = SchemaFactory.createForClass(KawaderReview);

KawaderReviewSchema.index({ kawaderId: 1, reviewerId: 1 }, { unique: true });
KawaderReviewSchema.index({ revieweeId: 1, createdAt: -1 });
