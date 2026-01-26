import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ArabonStatusLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Arabon', required: true })
  arabonId: Types.ObjectId;

  @Prop()
  oldStatus?: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop()
  userId?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ArabonStatusLogSchema = SchemaFactory.createForClass(ArabonStatusLog);
ArabonStatusLogSchema.index({ arabonId: 1, createdAt: -1 });
