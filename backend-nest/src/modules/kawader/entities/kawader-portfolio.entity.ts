import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kawader_portfolios' })
export class KawaderPortfolio extends Document {
  @ApiProperty({ description: 'معرف المستخدم صاحب المعرض' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'معرفات الوسائط (صور/فيديو)' })
  @Prop({ type: [Types.ObjectId], ref: 'KawaderMedia', default: [] })
  mediaIds: Types.ObjectId[];

  @ApiProperty({ description: 'وصف أو تعليق على عنصر المعرض', required: false })
  @Prop({ type: String, default: '' })
  caption?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KawaderPortfolioSchema = SchemaFactory.createForClass(KawaderPortfolio);

KawaderPortfolioSchema.index({ userId: 1, createdAt: -1 });
