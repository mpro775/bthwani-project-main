import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kenz_favorites' })
export class KenzFavorite extends Document {
  @ApiProperty({ description: 'معرف المستخدم' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'معرف إعلان كنز' })
  @Prop({ type: Types.ObjectId, ref: 'Kenz', required: true, index: true })
  kenzId: Types.ObjectId;
}

export const KenzFavoriteSchema = SchemaFactory.createForClass(KenzFavorite);
KenzFavoriteSchema.index({ userId: 1, kenzId: 1 }, { unique: true });
