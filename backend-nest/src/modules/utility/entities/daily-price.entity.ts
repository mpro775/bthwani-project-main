import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DailyPrice extends Document {
  @Prop({ required: true, enum: ['gas', 'water'] })
  kind: 'gas' | 'water';

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  price: number;

  @Prop()
  variant?: string; // gas: "20L" | water: "small|medium|large"
}

export const DailyPriceSchema = SchemaFactory.createForClass(DailyPrice);

// Indexes
DailyPriceSchema.index({ kind: 1, city: 1, date: 1, variant: 1 }, { unique: true });
DailyPriceSchema.index({ date: 1 });

