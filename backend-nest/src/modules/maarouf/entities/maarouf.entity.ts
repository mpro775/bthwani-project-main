import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found',
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum MaaroufCategory {
  PHONE = 'phone',
  PET = 'pet',
  ID = 'id',
  WALLET = 'wallet',
  KEYS = 'keys',
  BAG = 'bag',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Maarouf extends Document {
  @ApiProperty({
    description: 'معرف صاحب الإعلان',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({
    description: 'عنوان الإعلان',
    example: 'محفظة سوداء مفقودة في منطقة النرجس',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'تفاصيل الإعلان',
    required: false,
    example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'نوع الإعلان',
    required: false,
    enum: MaaroufKind,
    example: MaaroufKind.LOST,
  })
  @Prop()
  kind?: MaaroufKind;

  @ApiProperty({
    description: 'العلامات',
    required: false,
    type: [String],
    example: ['محفظة', 'بطاقات', 'نرجس'],
  })
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @ApiProperty({
    description: 'بيانات إضافية',
    required: false,
    example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' },
  })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'حالة الإعلان',
    enum: MaaroufStatus,
    default: MaaroufStatus.DRAFT,
  })
  @Prop({ default: 'draft' })
  status: MaaroufStatus;

  @ApiProperty({
    description: 'روابط الصور المرفقة',
    required: false,
    type: [String],
    example: ['https://example.com/img1.jpg'],
  })
  @Prop({ type: [String], default: [] })
  mediaUrls?: string[];

  @ApiProperty({
    description: 'التصنيف',
    required: false,
    enum: MaaroufCategory,
    example: MaaroufCategory.WALLET,
  })
  @Prop({ enum: MaaroufCategory, default: MaaroufCategory.OTHER })
  category?: MaaroufCategory;

  @ApiProperty({
    description: 'مكافأة اختيارية (بالريال)',
    required: false,
    example: 500,
  })
  @Prop({ type: Number, default: 0 })
  reward?: number;

  @ApiProperty({
    description: 'الموقع الجغرافي (GeoJSON Point)',
    required: false,
    example: { type: 'Point', coordinates: [44.2, 15.35] },
  })
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  })
  location?: { type: 'Point'; coordinates: [number, number] };

  @ApiProperty({
    description: 'خيار التوصيل',
    required: false,
    default: false,
  })
  @Prop({ default: false })
  deliveryToggle?: boolean;

  @ApiProperty({
    description: 'معرف طلب التوصيل المرتبط (إن وُجد)',
    required: false,
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'Delivery' })
  deliveryId?: Types.ObjectId;

  @ApiProperty({
    description: 'معرف الإعلان المطابق (lost↔found)',
    required: false,
    type: 'string',
  })
  @Prop({ type: Types.ObjectId, ref: 'Maarouf' })
  matchedToId?: Types.ObjectId;

  @ApiProperty({
    description: 'نشر بدون رقم هاتف',
    required: false,
    default: false,
  })
  @Prop({ default: false })
  isAnonymous?: boolean;

  @ApiProperty({
    description: 'تاريخ انتهاء الإعلان',
    required: false,
    type: Date,
  })
  @Prop({ type: Date })
  expiresAt?: Date;
}

export const MaaroufSchema = SchemaFactory.createForClass(Maarouf);

// فهرس للبحث الجغرافي
MaaroufSchema.index({ location: '2dsphere' });
