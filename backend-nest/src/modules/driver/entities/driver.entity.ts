import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class CurrentLocation {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

@Schema({ _id: false })
class ResidenceLocation {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  address?: string;

  @Prop()
  governorate?: string;

  @Prop()
  city?: string;
}

@Schema({ _id: false })
class Wallet {
  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  earnings: number;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

@Schema({ _id: false })
class DeliveryStats {
  @Prop({ default: 0 })
  deliveredCount: number;

  @Prop({ default: 0 })
  canceledCount: number;

  @Prop({ default: 0 })
  totalDistanceKm: number;
}

@Schema({ timestamps: true, collection: 'drivers' })
export class Driver extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({
    type: String,
    enum: ['rider_driver', 'light_driver', 'women_driver'],
    required: true,
  })
  role: string;

  @Prop({
    type: String,
    enum: ['motor', 'bike', 'car'],
    required: true,
  })
  vehicleType: string;

  @Prop({
    type: String,
    enum: ['light', 'medium', 'heavy'],
    default: 'light',
    index: true,
  })
  vehicleClass: string;

  @Prop({ default: 0, index: true })
  vehiclePower: number;

  @Prop({
    type: String,
    enum: ['primary', 'joker'],
    default: 'primary',
  })
  driverType: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isFemaleDriver: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: CurrentLocation })
  currentLocation?: CurrentLocation;

  @Prop({ type: ResidenceLocation })
  residenceLocation?: ResidenceLocation;

  @Prop({ type: Wallet, default: () => ({}) })
  wallet: Wallet;

  @Prop({ type: DeliveryStats, default: () => ({}) })
  deliveryStats: DeliveryStats;

  @Prop({ type: Date })
  jokerFrom?: Date;

  @Prop({ type: Date })
  jokerTo?: Date;

  @Prop()
  profileImage?: string;

  @Prop({ type: Types.ObjectId })
  glReceivableAccount?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  glDepositAccount?: Types.ObjectId;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

// Indexes
DriverSchema.index({ email: 1 });
DriverSchema.index({ phone: 1 });
DriverSchema.index({ isAvailable: 1 });
DriverSchema.index({ vehicleClass: 1, vehiclePower: 1 });
DriverSchema.index({ driverType: 1 });
DriverSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
