import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  image: string; // رابط الصورة

  @Prop()
  link?: string; // deep-link أو رابط خارجي

  @Prop({ type: Types.ObjectId, ref: 'Store' })
  store?: Types.ObjectId; // ربط بمتجر محدد

  @Prop({ type: Types.ObjectId, ref: 'MerchantCategory' })
  category?: Types.ObjectId; // ربط بفئة محددة

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // ترتيب العرض

  @Prop({ type: Date })
  startDate?: Date; // تاريخ البداية

  @Prop({ type: Date })
  endDate?: Date; // تاريخ النهاية

  @Prop({
    enum: ['home', 'category', 'store', 'search'],
    default: 'home',
  })
  placement?: string; // موضع العرض

  @Prop({ default: 0 })
  clicksCount?: number; // عدد النقرات

  @Prop({ default: 0 })
  viewsCount?: number; // عدد المشاهدات

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  createdBy?: Types.ObjectId;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Indexes
BannerSchema.index({ isActive: 1, order: 1 });
BannerSchema.index({ placement: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
