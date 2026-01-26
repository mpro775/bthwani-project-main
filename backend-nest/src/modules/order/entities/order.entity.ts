import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
} from '../enums/order-status.enum';

// Sub-schemas
@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: String,
    enum: ['merchantProduct', 'deliveryProduct'],
    required: true,
  })
  productType: string;

  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryStore', required: true })
  store: Types.ObjectId;

  @Prop()
  image?: string;
}

@Schema({ _id: false })
class Address {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop(raw({ lat: { type: Number }, lng: { type: Number } }))
  location: { lat: number; lng: number };
}

@Schema({ _id: false })
class StatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ type: Date, required: true, default: Date.now })
  changedAt: Date;

  @Prop({
    type: String,
    enum: ['admin', 'store', 'driver', 'customer'],
    required: true,
  })
  changedBy: string;
}

@Schema({ _id: false })
class Coupon {
  @Prop()
  code?: string;

  @Prop({ type: String, enum: ['percentage', 'fixed', 'free_shipping'] })
  type?: string;

  @Prop()
  value?: number;

  @Prop()
  discountOnItems?: number;

  @Prop()
  discountOnDelivery?: number;

  @Prop({ type: Date })
  appliedAt?: Date;
}

@Schema({ _id: false })
class Note {
  @Prop({ required: true })
  body: string;

  @Prop({
    type: String,
    enum: ['public', 'internal'],
    default: 'internal',
  })
  visibility: string;

  @Prop({
    type: String,
    enum: ['customer', 'admin', 'store', 'driver', 'system'],
    required: true,
  })
  byRole: string;

  @Prop({ type: Types.ObjectId })
  byId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'deliveryorders' })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver', index: true })
  driver?: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({ required: true })
  companyShare: number;

  @Prop({ required: true })
  platformShare: number;

  @Prop({ default: 0 })
  walletUsed: number;

  @Prop({ default: 0 })
  cashDue: number;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethod: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CREATED,
    index: true,
  })
  status: string;

  @Prop({ type: [StatusHistory], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ type: Coupon })
  coupon?: Coupon;

  @Prop({
    type: String,
    enum: Object.values(OrderType),
    default: OrderType.MARKETPLACE,
    index: true,
  })
  orderType: string;

  @Prop({ type: [Note], default: [] })
  notes: Note[];

  @Prop()
  returnReason?: string;

  @Prop({ type: String, enum: ['admin', 'customer', 'driver', 'store'] })
  returnBy?: string;

  @Prop()
  cancelReason?: string;

  @Prop({
    type: String,
    enum: ['admin', 'customer', 'driver', 'store', 'vendor'],
  })
  canceledBy?: string;

  @Prop({ type: Date })
  canceledAt?: Date;

  @Prop({ type: Date })
  returnedAt?: Date;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop()
  ratingComment?: string;

  @Prop({ type: Date })
  ratedAt?: Date;

  @Prop()
  adminNotes?: string;

  @Prop()
  customerNotes?: string;

  @Prop()
  driverNotes?: string;

  @Prop()
  totalAmount?: number;

  @Prop({ type: Address })
  deliveryAddress?: Address;

  @Prop({ type: Date })
  scheduledFor?: Date;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop()
  deliveryReceiptNumber?: string;

  @Prop({ type: Object })
  proofOfDelivery?: {
    imageUrl: string;
    signature?: string;
    notes?: string;
    uploadedAt: Date;
    uploadedBy: string;
  };

  // ✅ الحقول المضافة في المرحلة 3
  @Prop({ type: Date })
  estimatedDeliveryTime?: Date; // الوقت المتوقع للتوصيل

  @Prop({ type: Date })
  actualDeliveryTime?: Date; // الوقت الفعلي للتسليم

  @Prop({ type: Address })
  pickupLocation?: Address; // موقع الاستلام (للمتجر)

  @Prop({ type: Number })
  deliveryDistance?: number; // مسافة التوصيل بالكيلومتر

  @Prop({ type: Number })
  deliveryDuration?: number; // مدة التوصيل بالدقائق

  @Prop({ type: Number, default: 0 })
  tipAmount?: number; // قيمة البقشيش

  @Prop()
  deliveryInstructions?: string; // تعليمات التوصيل الخاصة

  @Prop({ type: Number, min: 1, max: 5 })
  driverRating?: number; // تقييم السائق من قبل العميل

  @Prop({ type: Number, min: 1, max: 5 })
  customerRating?: number; // تقييم العميل من قبل السائق
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// ==================== Indexes - محسّنة للأداء ====================

// Basic Indexes (من المشروع القديم)
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ driver: 1, status: 1 });
OrderSchema.index({ orderType: 1, createdAt: -1 });
OrderSchema.index({ 'address.city': 1 });
OrderSchema.index({ createdAt: -1 });

// ⚡ Performance Indexes (جديدة)
OrderSchema.index({ 'items.store': 1, status: 1 }); // للمتاجر: طلباتهم حسب الحالة
OrderSchema.index({ paymentMethod: 1, createdAt: -1 }); // تحليلات طرق الدفع
OrderSchema.index({ driver: 1, status: 1, createdAt: -1 }); // للسائق: طلباته النشطة
OrderSchema.index({ status: 1, 'address.city': 1 }); // طلبات مدينة معينة حسب الحالة
OrderSchema.index({ user: 1, status: 1, createdAt: -1 }); // طلبات المستخدم النشطة

// Compound Indexes للاستعلامات المعقدة
OrderSchema.index({ orderType: 1, status: 1, createdAt: -1 }); // للتقارير والتحليلات
OrderSchema.index({ paid: 1, paymentMethod: 1 }); // للعمليات المالية
OrderSchema.index({ createdAt: -1, status: 1, orderType: 1 }); // للوحة التحكم

// Indexes للبحث والإحصائيات
OrderSchema.index({ 'statusHistory.changedAt': -1 }); // لتتبع تاريخ التغييرات
OrderSchema.index({ deliveredAt: -1 }, { sparse: true }); // للطلبات المسلمة فقط
OrderSchema.index({ canceledAt: -1 }, { sparse: true }); // للطلبات الملغاة فقط
OrderSchema.index({ estimatedDeliveryTime: 1 }, { sparse: true }); // للطلبات المجدولة
OrderSchema.index({ driverRating: -1 }, { sparse: true }); // لتقييمات السائقين

// Pre-save middleware
OrderSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<Order> & Record<string, any>;
  if (update.status === OrderStatus.PICKED_UP) {
    update.assignedAt = new Date();
  }
  if (update.status === OrderStatus.DELIVERED) {
    update.deliveredAt = new Date();
    update.actualDeliveryTime = new Date(); // ✅ إضافة الوقت الفعلي
  }
  this.setUpdate(update);
  next();
});
