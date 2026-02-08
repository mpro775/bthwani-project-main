import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KenzDealStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'kenz_deals' })
export class KenzDeal extends Document {
  @ApiProperty({ description: 'معرف الإعلان' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;

  @ApiProperty({ description: 'معرف المشتري' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId: Types.ObjectId;

  @ApiProperty({ description: 'معرف البائع (من الإعلان)' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @ApiProperty({ description: 'مبلغ الصفقة' })
  @Prop({ required: true })
  amount: number;

  @ApiProperty({ description: 'حالة الصفقة', enum: KenzDealStatus })
  @Prop({ type: String, enum: Object.values(KenzDealStatus), default: KenzDealStatus.PENDING })
  status: KenzDealStatus;

  @ApiProperty({ description: 'معرف معاملة الحجز في المحفظة', required: false })
  @Prop()
  walletHoldTransactionId?: string;

  @ApiProperty({ description: 'تاريخ الإكمال', required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ description: 'تاريخ الإلغاء', required: false })
  @Prop({ type: Date })
  cancelledAt?: Date;
}

export const KenzDealSchema = SchemaFactory.createForClass(KenzDeal);

KenzDealSchema.index({ kenzId: 1, buyerId: 1 });
KenzDealSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
KenzDealSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
KenzDealSchema.index({ status: 1 });
