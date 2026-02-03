import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// تعريف صريح لـ subdocument لتجنّب مشكلة حفظ _id فقط مع NestJS SchemaFactory
export const CartItemSchema = new MongooseSchema(
  {
    productType: {
      type: String,
      required: true,
      enum: ['merchantProduct', 'deliveryProduct', 'restaurantProduct'],
    },
    productId: { type: MongooseSchema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    store: { type: MongooseSchema.Types.ObjectId, required: true, ref: 'Store' },
    image: { type: String },
    options: { type: MongooseSchema.Types.Mixed },
  },
  { _id: true },
);

export class CartItem {
  productType: string;
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  store: Types.ObjectId;
  image?: string;
  options?: Record<string, any>;
}

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
