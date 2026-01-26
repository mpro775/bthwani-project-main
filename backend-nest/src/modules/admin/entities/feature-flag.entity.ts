import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'feature_flags' })
export class FeatureFlag extends Document {
  @Prop({ required: true, unique: true, type: String })
  key: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false })
  enabled: boolean;

  @Prop({
    enum: ['development', 'staging', 'production', 'all'],
    default: 'all',
    type: String,
  })
  environment: string;

  @Prop({ type: [String], default: [] })
  enabledForUsers: string[]; // user IDs for beta testing

  @Prop({ type: [String], default: [] })
  enabledForRoles: string[]; // roles

  @Prop({ type: Number, min: 0, max: 100 })
  rolloutPercentage?: number; // for gradual rollout

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

// Indexes
FeatureFlagSchema.index({ key: 1 }, { unique: true });
FeatureFlagSchema.index({ enabled: 1 });
FeatureFlagSchema.index({ environment: 1 });

