import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'marketers' })
export class Marketer extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] })
  status: string;

  @Prop()
  territory?: string;

  @Prop({ default: 0 })
  commissionRate: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: 0 })
  totalStoresOnboarded: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deactivationReason?: string;

  @Prop()
  deactivatedAt?: Date;
}

export const MarketerSchema = SchemaFactory.createForClass(Marketer);
