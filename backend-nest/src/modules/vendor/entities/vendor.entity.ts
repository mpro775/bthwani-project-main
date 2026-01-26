import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class NotificationSettings {
  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: true })
  orderAlerts: boolean;

  @Prop({ default: true })
  financialAlerts: boolean;

  @Prop({ default: false })
  marketingAlerts: boolean;

  @Prop({ default: true })
  systemUpdates: boolean;
}

@Schema({ _id: false })
class PendingDeletion {
  @Prop({ type: Date })
  requestedAt?: Date;

  @Prop()
  reason?: string;

  @Prop({ default: false })
  exportData?: boolean;
}

@Schema({ timestamps: true, collection: 'vendors' })
export class Vendor extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'DeliveryStore',
    required: true,
    index: true,
  })
  store: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ index: true })
  createdByMarketerUid?: string;

  @Prop({
    type: String,
    enum: ['marketerQuickOnboard', 'admin', 'other'],
    default: 'admin',
  })
  source: string;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop()
  expoPushToken?: string;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notificationSettings?: NotificationSettings;

  @Prop({ type: PendingDeletion })
  pendingDeletion?: PendingDeletion;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Indexes
VendorSchema.index({ phone: 1 });
VendorSchema.index({ store: 1 });
VendorSchema.index({ createdByMarketerUid: 1, createdAt: -1 });
VendorSchema.index({ isActive: 1 });
