import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Settlement extends Document {
  @Prop({ required: true, unique: true })
  settlementNumber: string; // رقم التسوية (مثلاً: ST-2025-001)

  @Prop({ required: true, type: Types.ObjectId, refPath: 'entityModel' })
  entity: Types.ObjectId; // Vendor, Driver, etc.

  @Prop({ required: true, enum: ['Vendor', 'Driver', 'Marketer'] })
  entityModel: string;

  @Prop({ required: true })
  periodStart: Date; // بداية الفترة

  @Prop({ required: true })
  periodEnd: Date; // نهاية الفترة

  @Prop({ required: true })
  totalRevenue: number; // إجمالي الإيرادات

  @Prop({ required: true })
  totalCommission: number; // إجمالي العمولات

  @Prop({ required: true })
  totalDeductions: number; // إجمالي الخصومات

  @Prop({ required: true })
  netAmount: number; // الصافي (Revenue - Commission - Deductions)

  @Prop({ required: true })
  ordersCount: number; // عدد الطلبات

  @Prop({
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'paid', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
  orders?: Types.ObjectId[]; // قائمة الطلبات المشمولة

  @Prop({ type: Types.ObjectId, ref: 'PayoutBatch' })
  payoutBatch?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  breakdown?: {
    deliveryFees?: number;
    tips?: number;
    bonuses?: number;
    penalties?: number;
    adjustments?: number;
  };
}

export const SettlementSchema = SchemaFactory.createForClass(Settlement);

// Indexes
SettlementSchema.index({ settlementNumber: 1 }, { unique: true });
SettlementSchema.index({ entity: 1, entityModel: 1 });
SettlementSchema.index({ status: 1, createdAt: -1 });
SettlementSchema.index({ periodStart: 1, periodEnd: 1 });
