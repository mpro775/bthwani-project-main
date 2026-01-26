import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class UtilityAddress {
  @Prop({ required: true })
  label: string;

  @Prop()
  street?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: Object })
  location: { lat: number; lng: number };
}

@Schema({ _id: false })
class UtilityNote {
  @Prop({ required: true })
  body: string;

  @Prop({ type: String, enum: ['public', 'internal'], default: 'public' })
  visibility: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ _id: false })
class StatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ type: Date, required: true, default: Date.now })
  changedAt: Date;

  @Prop({ type: String, enum: ['admin', 'customer', 'driver', 'system'] })
  changedBy: string;
}

@Schema({ timestamps: true, collection: 'utilityorders' })
export class UtilityOrder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver', index: true })
  driver?: Types.ObjectId;

  @Prop({ type: String, enum: ['gas', 'water'], required: true, index: true })
  kind: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  variant: string; // "20L" للغاز أو "small|medium|large" للماء

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  productPrice: number; // سعر المنتج فقط

  @Prop({ required: true })
  deliveryFee: number; // رسوم التوصيل

  @Prop({ required: true })
  total: number; // الإجمالي

  @Prop({ type: UtilityAddress, required: true })
  address: UtilityAddress;

  @Prop({
    type: String,
    enum: ['cash', 'wallet', 'card', 'mixed'],
    required: true,
  })
  paymentMethod: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop({
    type: String,
    enum: [
      'created',
      'confirmed',
      'assigned',
      'picked_up',
      'in_transit',
      'delivered',
      'cancelled',
    ],
    default: 'created',
    index: true,
  })
  status: string;

  @Prop({ type: [StatusHistory], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ type: [UtilityNote], default: [] })
  notes: UtilityNote[];

  @Prop({ type: Date })
  scheduledFor?: Date;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  canceledAt?: Date;

  @Prop()
  cancelReason?: string;

  @Prop({ type: String, enum: ['admin', 'customer', 'driver', 'system'] })
  canceledBy?: string;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop()
  ratingComment?: string;

  @Prop({ type: Date })
  ratedAt?: Date;

  @Prop({ default: 0 })
  walletUsed?: number;

  @Prop({ default: 0 })
  cashDue?: number;

  @Prop({ type: Object })
  proofOfDelivery?: {
    imageUrl: string;
    signature?: string;
    notes?: string;
    uploadedAt: Date;
  };
}

export const UtilityOrderSchema = SchemaFactory.createForClass(UtilityOrder);

// Indexes
UtilityOrderSchema.index({ user: 1, createdAt: -1 });
UtilityOrderSchema.index({ driver: 1, status: 1 });
UtilityOrderSchema.index({ kind: 1, city: 1, createdAt: -1 });
UtilityOrderSchema.index({ status: 1, createdAt: -1 });
UtilityOrderSchema.index({ createdAt: -1 });
UtilityOrderSchema.index({ scheduledFor: 1 }, { sparse: true });

