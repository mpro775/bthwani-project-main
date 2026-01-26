import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'referralevents' })
export class ReferralEvent extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referrer?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referee?: Types.ObjectId;

  @Prop({ required: true, enum: ['registered', 'first_order', 'completed'] })
  eventType: string;

  @Prop({ default: 0 })
  rewardAmount: number;

  @Prop({ default: false })
  rewardClaimed: boolean;

  @Prop()
  claimedAt?: Date;
}

export const ReferralEventSchema = SchemaFactory.createForClass(ReferralEvent);
