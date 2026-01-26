import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'app_settings' })
export class AppSettings extends Document {
  @Prop({ required: true, unique: true, type: String })
  key: string;

  @Prop({ required: true, type: Object })
  value: any;

  @Prop({ enum: ['string', 'number', 'boolean', 'object', 'array'], type: String })
  type: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean; // يمكن للعملاء قراءته

  @Prop({ type: Boolean, default: false })
  isEncrypted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: String })
  category?: string; // 'general', 'payment', 'delivery', 'commission'

  @Prop({
    type: {
      min: Number,
      max: Number,
      pattern: String,
      enum: [String],
    },
  })
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);

// Indexes
AppSettingsSchema.index({ key: 1 }, { unique: true });
AppSettingsSchema.index({ category: 1 });
AppSettingsSchema.index({ isPublic: 1 });

