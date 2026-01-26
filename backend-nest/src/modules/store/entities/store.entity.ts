import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Location {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}

@Schema({ _id: false })
class WorkSchedule {
  @Prop({ required: true })
  day: string;

  @Prop({ required: true })
  open: boolean;

  @Prop()
  from?: string;

  @Prop()
  to?: string;
}

@Schema({ timestamps: true, collection: 'deliverystores' })
export class Store extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  name_ar?: string;

  @Prop()
  name_en?: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryCategory', index: true })
  category?: Types.ObjectId;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  image?: string;

  @Prop()
  logo?: string;

  @Prop({ default: false })
  forceClosed: boolean;

  @Prop({ default: false })
  forceOpen: boolean;

  @Prop({ type: [WorkSchedule], default: [] })
  schedule: WorkSchedule[];

  @Prop({ default: 0 })
  commissionRate: number;

  @Prop({ default: true })
  takeCommission: boolean;

  @Prop({ default: false })
  isTrending: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingsCount: number;

  @Prop({ default: 30 })
  avgPrepTimeMin: number;

  @Prop({ default: 0 })
  pendingOrders: number;

  @Prop({
    type: String,
    enum: ['restaurant', 'grocery', 'pharmacy', 'bakery', 'cafe', 'other'],
  })
  usageType?: string;

  @Prop({
    type: String,
    enum: ['marketerQuickOnboard', 'admin', 'other'],
    default: 'admin',
  })
  source: string;

  @Prop({ index: true })
  createdByMarketerUid?: string;

  @Prop()
  deliveryRadiusKm?: number;

  @Prop()
  deliveryBaseFee?: number;

  @Prop()
  deliveryPerKmFee?: number;

  @Prop()
  minOrderAmount?: number;

  @Prop({ type: Types.ObjectId })
  glPayableAccount?: Types.ObjectId;
}

export const StoreSchema = SchemaFactory.createForClass(Store);

// Indexes
StoreSchema.index({ name: 'text', name_ar: 'text', name_en: 'text' });
StoreSchema.index({ isActive: 1 });
StoreSchema.index({ category: 1 });
StoreSchema.index({ isTrending: 1, isFeatured: 1 });
StoreSchema.index({ 'location.lat': 1, 'location.lng': 1 });
StoreSchema.index({ createdByMarketerUid: 1 });
