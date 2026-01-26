import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum AmaniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Amani extends Document {
  @ApiProperty({
    description: 'معرف المستخدم صاحب الطلب',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({
    description: 'عنوان الطلب',
    example: 'نقل عائلي من الرياض إلى جدة',
    type: 'string'
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'وصف تفصيلي للطلب',
    example: 'نقل عائلي مكون من 4 أفراد مع أمتعة',
    required: false,
    type: 'string'
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'موقع الانطلاق',
    example: { lat: 24.7136, lng: 46.6753, address: 'الرياض، المملكة العربية السعودية' },
    required: false
  })
  @Prop({ type: Object })
  origin?: any;

  @ApiProperty({
    description: 'الوجهة المطلوبة',
    example: { lat: 21.4858, lng: 39.1925, address: 'جدة، المملكة العربية السعودية' },
    required: false
  })
  @Prop({ type: Object })
  destination?: any;

  @ApiProperty({
    description: 'بيانات إضافية للطلب',
    example: { passengers: 4, luggage: true, specialRequests: 'كرسي أطفال' },
    required: false
  })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'حالة الطلب',
    enum: AmaniStatus,
    default: AmaniStatus.DRAFT,
    example: AmaniStatus.DRAFT
  })
  @Prop({ default: 'draft' })
  status: AmaniStatus;

  @ApiProperty({
    description: 'السائق المعين للطلب',
    example: '507f1f77bcf86cd799439013',
    type: 'string',
    required: false
  })
  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  driver?: Types.ObjectId;

  @ApiProperty({
    description: 'تاريخ تعيين السائق',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @Prop({ type: Date })
  assignedAt?: Date;

  @ApiProperty({
    description: 'تاريخ استلام الركاب',
    example: '2024-01-15T11:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @Prop({ type: Date })
  pickedUpAt?: Date;

  @ApiProperty({
    description: 'تاريخ إكمال الرحلة',
    example: '2024-01-15T12:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({
    description: 'سجل تغييرات الحالة',
    type: 'array',
    required: false
  })
  @Prop({ type: [Object], default: [] })
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    changedBy?: string;
  }>;

  @ApiProperty({
    description: 'سبب الإلغاء',
    example: 'تم الإلغاء من قبل العميل',
    type: 'string',
    required: false
  })
  @Prop()
  cancellationReason?: string;

  @ApiProperty({
    description: 'السعر المقدر',
    example: 150,
    type: 'number',
    required: false
  })
  @Prop()
  estimatedPrice?: number;

  @ApiProperty({
    description: 'السعر الفعلي',
    example: 150,
    type: 'number',
    required: false
  })
  @Prop()
  actualPrice?: number;

  @ApiProperty({
    description: 'تقييم الخدمة',
    type: 'object',
    required: false
  })
  @Prop({ type: Object })
  rating?: {
    driver: number;
    service: number;
    comments?: string;
    ratedAt: Date;
  };

  @ApiProperty({
    description: 'موقع السائق الحالي',
    type: 'object',
    required: false
  })
  @Prop({ type: Object })
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };

  @ApiProperty({
    description: 'سجل المسار',
    type: 'array',
    required: false
  })
  @Prop({ type: [Object], default: [] })
  routeHistory?: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
  }>;

  @ApiProperty({
    description: 'تاريخ الإنشاء',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'تاريخ آخر تحديث',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  updatedAt: Date;
}

export const AmaniSchema = SchemaFactory.createForClass(Amani);

// Indexes for better query performance
AmaniSchema.index({ driver: 1, status: 1 });
AmaniSchema.index({ ownerId: 1, createdAt: -1 });
AmaniSchema.index({ status: 1, createdAt: -1 });
