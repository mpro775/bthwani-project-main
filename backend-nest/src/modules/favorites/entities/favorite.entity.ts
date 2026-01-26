import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  itemId: string;

  @Prop({
    type: String,
    enum: ['product', 'restaurant'],
    required: true,
    index: true,
  })
  itemType: string;

  @Prop({
    type: {
      title: String,
      image: String,
      price: Number,
      rating: Number,
      storeId: String,
      storeType: String,
    },
    default: {},
  })
  itemSnapshot?: {
    title?: string;
    image?: string;
    price?: number;
    rating?: number;
    storeId?: string;
    storeType?: 'grocery' | 'restaurant';
  };

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Compound index for unique user-item-type combination
FavoriteSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

// Index for faster queries
FavoriteSchema.index({ user: 1, itemType: 1 });
