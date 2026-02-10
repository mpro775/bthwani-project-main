import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'kawader_media' })
export class KawaderMedia extends Document {
  @ApiProperty({ description: 'رابط الوسيط (صورة)' })
  @Prop({ type: String, required: true })
  url: string;

  @ApiProperty({ description: 'معرف المستخدم الذي رفع الوسيط' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KawaderMediaSchema = SchemaFactory.createForClass(KawaderMedia);
