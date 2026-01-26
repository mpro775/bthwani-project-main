import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class CartItem {
  @Prop({
    required: true,
    enum: ['merchantProduct', 'deliveryProduct', 'restaurantProduct'],
  })
  productType: string;

  @Prop({ required: true, type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Store' })
  store: Types.ObjectId;

  @Prop()
  image?: string;

  @Prop({ type: Object })
  options?: Record<string, any>; // خيارات المنتج (حجم، لون، إلخ)
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ required: true, default: 0 })
  total: number;

  @Prop()
  cartId?: string; // معرف السلة (للمشاركة)

  @Prop()
  note?: string; // ملاحظات على الطلب

  @Prop({ type: Object })
  deliveryAddress?: {
    street: string;
    city: string;
    building?: string;
    floor?: string;
    apartment?: string;
    location?: { lat: number; lng: number };
  };

  @Prop({ type: Date })
  lastModified: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ user: 1 }, { unique: true });
CartSchema.index({ cartId: 1 }, { sparse: true });
CartSchema.index({ lastModified: -1 });

// Pre-save middleware لحساب الإجمالي
CartSchema.pre('save', function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  this.lastModified = new Date();
  next();
});
