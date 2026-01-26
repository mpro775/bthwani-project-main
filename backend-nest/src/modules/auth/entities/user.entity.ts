import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Sub-schemas
@Schema({ _id: false })
class Address {
  @Prop()
  label?: string;

  @Prop()
  street?: string;

  @Prop()
  city?: string;

  @Prop(raw({ lat: Number, lng: Number }))
  location?: { lat: number; lng: number };
}

@Schema({ _id: false })
class Wallet {
  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  onHold: number;

  @Prop({ default: 'YER' })
  currency: string;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: 0 })
  totalEarned: number;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ default: 0 })
  savings: number;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

@Schema({ _id: false })
class Security {
  @Prop({ default: null, select: false }) // ⚠️ مشفر - لا يُعرض افتراضياً
  pinCodeHash?: string;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ default: 0 })
  pinAttempts?: number;

  @Prop({ type: Date })
  pinLockedUntil?: Date;
}

@Schema({ _id: false })
class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: ['credit', 'debit'], required: true })
  type: string;

  @Prop({
    type: String,
    enum: [
      'agent',
      'card',
      'transfer',
      'payment',
      'escrow',
      'reward',
      'kuraimi',
    ],
  })
  method: string;

  @Prop()
  description?: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

@Schema({ _id: false })
class NotificationPreferences {
  @Prop({ default: true })
  email: boolean;

  @Prop({ default: false })
  sms: boolean;

  @Prop({ default: true })
  push: boolean;
}

@Schema({ _id: false })
class NotificationItem {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object })
  data?: any;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop()
  aliasName?: string;

  @Prop({ unique: true, sparse: true, lowercase: true })
  email?: string;

  @Prop()
  phone?: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ select: false })
  passwordResetCode?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires?: Date;

  @Prop({
    type: String,
    enum: ['regular', 'bronze', 'silver', 'gold', 'vip'],
    default: 'regular',
  })
  classification: string;

  @Prop({ default: 0 })
  negativeRatingCount: number;

  @Prop({
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  })
  role: string;

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  @Prop({ type: Types.ObjectId })
  defaultAddressId?: Types.ObjectId;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({
    type: String,
    enum: ['firebase', 'local'],
    default: 'firebase',
  })
  authProvider: string;

  @Prop({ unique: true, sparse: true })
  firebaseUID?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  favorites: Types.ObjectId[];

  @Prop({ type: String, enum: ['ar', 'en'], default: 'ar' })
  language: string;

  @Prop({ type: String, enum: ['light', 'dark'], default: 'light' })
  theme: string;

  @Prop({ type: NotificationPreferences, default: () => ({}) })
  notifications: NotificationPreferences;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isBlacklisted: boolean;

  @Prop()
  pushToken?: string;

  @Prop({ type: Wallet, default: () => ({}) })
  wallet: Wallet;

  @Prop({ type: Security, default: () => ({}) })
  security: Security;

  @Prop({ type: [Transaction], default: [] })
  transactions: Transaction[];

  @Prop({ type: [NotificationItem], default: [] })
  notificationsFeed: NotificationItem[];

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ==================== Indexes - محسّنة للأداء ====================

// Basic Indexes (من المشروع القديم)
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ firebaseUID: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1 });

// ⚡ Performance Indexes (جديدة)
UserSchema.index({ phone: 1, isActive: 1 }); // للبحث بالهاتف + التحقق من النشاط
UserSchema.index({ 'wallet.balance': 1 }); // لاستعلامات المحفظة السريعة
UserSchema.index({ classification: 1, createdAt: -1 }); // لفرز المستخدمين حسب التصنيف
UserSchema.index({ isActive: 1, isBanned: 1 }); // للفلترة السريعة
UserSchema.index({ 'wallet.loyaltyPoints': -1 }); // لترتيب حسب نقاط الولاء

// Compound Indexes للاستعلامات المعقدة
UserSchema.index({ role: 1, classification: 1, isActive: 1 }); // للإدارة والتحليلات
UserSchema.index({ createdAt: -1, emailVerified: 1 }); // للمستخدمين الجدد المفعّلين
