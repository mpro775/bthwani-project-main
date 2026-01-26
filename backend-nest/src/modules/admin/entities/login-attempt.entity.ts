import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'login_attempts' })
export class LoginAttempt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true, type: String })
  identifier: string; // email or phone

  @Prop({ required: true, type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ required: true, enum: ['success', 'failure'], type: String })
  status: string;

  @Prop({ type: String })
  failureReason?: string; // 'invalid_credentials', 'account_locked', 'banned'

  @Prop({
    type: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
  })
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({ type: String })
  device?: string;

  @Prop({ type: String })
  browser?: string;

  @Prop({ type: Boolean, default: false })
  isSuspicious: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);

// Indexes
LoginAttemptSchema.index({ identifier: 1, createdAt: -1 });
LoginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });
LoginAttemptSchema.index({ userId: 1, createdAt: -1 });
LoginAttemptSchema.index({ status: 1, createdAt: -1 });
LoginAttemptSchema.index({ isSuspicious: 1 });

// TTL Index - حذف تلقائي بعد 30 يوم
LoginAttemptSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }, // 30 days
);

