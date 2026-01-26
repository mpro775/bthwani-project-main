import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class SheinCartItem {
  @Prop({ required: true })
  sheinProductId: string; // معرف المنتج من Shein

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number; // السعر بالدولار

  @Prop({ required: true })
  priceYER: number; // السعر بالريال اليمني

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  image?: string;

  @Prop()
  size?: string;

  @Prop()
  color?: string;

  @Prop({ type: Object })
  attributes?: Record<string, any>;

  @Prop()
  shippingTime?: string; // وقت الشحن المتوقع

  @Prop({ default: 0 })
  shippingCost?: number; // تكلفة شحن هذا العنصر
}

const SheinCartItemSchema = SchemaFactory.createForClass(SheinCartItem);

@Schema({ timestamps: true })
export class SheinCart extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: [SheinCartItemSchema], default: [] })
  items: SheinCartItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number; // مجموع المنتجات

  @Prop({ required: true, default: 0 })
  internationalShipping: number; // شحن دولي

  @Prop({ required: true, default: 0 })
  localShipping: number; // شحن محلي

  @Prop({ required: true, default: 0 })
  serviceFee: number; // رسوم الخدمة

  @Prop({ required: true, default: 0 })
  total: number; // الإجمالي النهائي

  @Prop({ default: 'USD' })
  currency: string;

  @Prop()
  exchangeRate?: number; // سعر الصرف المستخدم

  @Prop({ type: Object })
  deliveryAddress?: {
    street: string;
    city: string;
    phone: string;
    location?: { lat: number; lng: number };
  };

  @Prop()
  note?: string;

  @Prop({ type: Date })
  lastModified: Date;
}

export const SheinCartSchema = SchemaFactory.createForClass(SheinCart);

// Indexes
SheinCartSchema.index({ user: 1 }, { unique: true });
SheinCartSchema.index({ lastModified: -1 });

// Pre-save middleware لحساب الإجمالي
SheinCartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.priceYER * item.quantity,
    0,
  );
  this.total =
    this.subtotal +
    this.internationalShipping +
    this.localShipping +
    this.serviceFee;
  this.lastModified = new Date();
  next();
});
