import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Merchant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop()
  logo?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendor?: Types.ObjectId; // ربط بنظام Vendor

  @Prop({ type: Types.ObjectId, ref: 'Store' })
  store?: Types.ObjectId; // ربط بنظام Store

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  businessCategories?: string[]; // فئات العمل (بقالة، مطعم، إلخ)

  @Prop({ type: Object })
  address?: {
    street: string;
    city: string;
    location?: { lat: number; lng: number };
  };

  @Prop({ type: Object })
  businessHours?: {
    openTime: string;
    closeTime: string;
    daysOff?: string[];
  };

  @Prop({ type: Object })
  contact?: {
    managerName?: string;
    managerPhone?: string;
    email?: string;
  };

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// Indexes
MerchantSchema.index({ email: 1 }, { unique: true });
MerchantSchema.index({ phone: 1 }, { unique: true, sparse: true });
MerchantSchema.index({ isActive: 1 });
MerchantSchema.index({ vendor: 1 });
MerchantSchema.index({ store: 1 });
