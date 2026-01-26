import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'commissionplans' })
export class CommissionPlan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['percentage', 'fixed', 'tiered'] })
  type: string;

  @Prop({ required: true })
  rate: number;

  @Prop()
  minOrders?: number;

  @Prop()
  maxOrders?: number;

  @Prop({ type: [{ from: Number, to: Number, rate: Number }] })
  tiers?: Array<{ from: number; to: number; rate: number }>;

  @Prop({ default: true })
  isActive: boolean;
}

export const CommissionPlanSchema =
  SchemaFactory.createForClass(CommissionPlan);
