import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ArabonRequestStatus = 'pending' | 'accepted' | 'rejected';

@Schema({ timestamps: true })
export class ArabonRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Arabon', required: true })
  arabonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId;

  @Prop()
  message?: string;

  @Prop({ default: 'pending' })
  status: ArabonRequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: Types.ObjectId;
}

export const ArabonRequestSchema = SchemaFactory.createForClass(ArabonRequest);
ArabonRequestSchema.index({ arabonId: 1, createdAt: -1 });
ArabonRequestSchema.index({ requesterId: 1, arabonId: 1 }, { unique: true });
