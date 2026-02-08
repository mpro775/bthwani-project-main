import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kenz_bids' })
export class KenzBid extends Document {
  @ApiProperty({ description: 'معرف الإعلان (المزاد)' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المزايد' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  bidderId: Types.ObjectId;

  @ApiProperty({ description: 'مبلغ المزايدة' })
  @Prop({ required: true })
  amount: number;
}

export const KenzBidSchema = SchemaFactory.createForClass(KenzBid);

KenzBidSchema.index({ kenzId: 1, amount: -1 });
KenzBidSchema.index({ kenzId: 1, bidderId: 1, createdAt: -1 });
