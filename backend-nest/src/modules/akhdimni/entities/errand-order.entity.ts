import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class ErrandPoint {
  @Prop({ required: true })
  label: string; // اسم النقطة

  @Prop()
  street?: string;

  @Prop()
  city?: string;

  @Prop()
  contactName?: string;

  @Prop()
  phone?: string;

  @Prop({ type: Object, required: true })
  location: { lat: number; lng: number };

  @Prop({ type: Object })
  geo?: { type: 'Point'; coordinates: [number, number] }; // GeoJSON
}

const ErrandPointSchema = SchemaFactory.createForClass(ErrandPoint);

export class ErrandDetails {
  @Prop({
    required: true,
    enum: ['docs', 'parcel', 'groceries', 'other'],
  })
  category: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['small', 'medium', 'large'] })
  size?: string;

  @Prop()
  weightKg?: number;

  @Prop({ type: ErrandPointSchema, required: true })
  pickup: ErrandPoint;

  @Prop({ type: ErrandPointSchema, required: true })
  dropoff: ErrandPoint;

  @Prop({ type: [Object] })
  waypoints?: Array<{
    label?: string;
    location: { lat: number; lng: number };
  }>;

  @Prop({ required: true })
  distanceKm: number; // المسافة الإجمالية

  @Prop({ default: 0 })
  tip?: number; // إكرامية
}

const ErrandDetailsSchema = SchemaFactory.createForClass(ErrandDetails);

@Schema({ timestamps: true })
export class ErrandOrder extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string; // رقم المهمة (ERR-2025-001)

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: ErrandDetailsSchema, required: true })
  errand: ErrandDetails;

  @Prop({ required: true })
  deliveryFee: number; // رسوم التوصيل

  @Prop({ required: true })
  totalPrice: number; // الإجمالي (deliveryFee + tip)

  @Prop({
    required: true,
    enum: ['wallet', 'cash', 'card', 'mixed'],
    default: 'wallet',
  })
  paymentMethod: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop({ default: 0 })
  walletUsed: number; // المبلغ المستخدم من المحفظة

  @Prop({ default: 0 })
  cashDue: number; // المبلغ المستحق نقداً

  @Prop({
    required: true,
    enum: [
      'created',
      'assigned',
      'driver_enroute_pickup',
      'picked_up',
      'driver_enroute_dropoff',
      'delivered',
      'cancelled',
    ],
    default: 'created',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  driver?: Types.ObjectId;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Date })
  pickedUpAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  scheduledFor?: Date; // وقت مجدول

  @Prop()
  cancellationReason?: string;

  @Prop({ type: [Object] })
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;

  @Prop({ type: Object })
  rating?: {
    driver: number;
    service: number;
    comments?: string;
    ratedAt: Date;
  };

  @Prop()
  notes?: string;
}

export const ErrandOrderSchema = SchemaFactory.createForClass(ErrandOrder);

// Indexes
ErrandOrderSchema.index({ orderNumber: 1 }, { unique: true });
ErrandOrderSchema.index({ user: 1, createdAt: -1 });
ErrandOrderSchema.index({ driver: 1, status: 1 });
ErrandOrderSchema.index({ status: 1, createdAt: -1 });
ErrandOrderSchema.index({ 'errand.pickup.geo': '2dsphere' });
ErrandOrderSchema.index({ 'errand.dropoff.geo': '2dsphere' });
