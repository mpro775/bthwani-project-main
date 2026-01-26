import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'onboardings' })
export class Onboarding extends Document {
  @Prop({ required: true })
  storeName: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({
    required: true,
    type: {
      street: String,
      city: String,
      district: String,
      location: { lat: Number, lng: Number },
    },
  })
  address: {
    street: string;
    city: string;
    district?: string;
    location: { lat: number; lng: number };
  };

  @Prop({ required: true, enum: ['store', 'vendor', 'driver'] })
  type: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Marketer' })
  marketer?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId })
  createdEntityId?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;
}

export const OnboardingSchema = SchemaFactory.createForClass(Onboarding);
