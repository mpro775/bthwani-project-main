import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum SuppressionChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum SuppressionReason {
  USER_REQUEST = 'user_request', // طلب من المستخدم
  BOUNCE = 'bounce', // ارتداد البريد
  COMPLAINT = 'complaint', // شكوى spam
  UNSUBSCRIBE = 'unsubscribe', // إلغاء الاشتراك
  INVALID_CONTACT = 'invalid_contact', // معلومات اتصال غير صالحة
  TOO_MANY_FAILURES = 'too_many_failures', // فشل متكرر
  ADMIN_BLOCK = 'admin_block', // حظر إداري
}

@Schema({ timestamps: true, collection: 'notification_suppressions' })
export class NotificationSuppression extends Document {
  @ApiProperty({ description: 'معرف المستخدم' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'القنوات المحظورة',
    enum: SuppressionChannel,
    isArray: true,
  })
  @Prop({
    type: [String],
    enum: Object.values(SuppressionChannel),
    default: [],
  })
  suppressedChannels: SuppressionChannel[];

  @ApiProperty({
    description: 'سبب الحظر',
    enum: SuppressionReason,
  })
  @Prop({
    type: String,
    enum: Object.values(SuppressionReason),
    required: true,
  })
  reason: SuppressionReason;

  @ApiProperty({ description: 'تفاصيل إضافية عن الحظر' })
  @Prop({ type: String })
  details?: string;

  @ApiProperty({ description: 'تاريخ انتهاء الحظر (اختياري)' })
  @Prop({ type: Date })
  expiresAt?: Date;

  @ApiProperty({ description: 'هل الحظر نشط؟' })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'عدد مرات الفشل (للتتبع)' })
  @Prop({ type: Number, default: 0 })
  failureCount: number;

  @ApiProperty({ description: 'آخر محاولة فاشلة' })
  @Prop({ type: Date })
  lastFailureAt?: Date;

  @ApiProperty({ description: 'من قام بالحظر (system, user, admin)' })
  @Prop({ type: String, enum: ['system', 'user', 'admin'], default: 'system' })
  suppressedBy: string;

  @ApiProperty({ description: 'معرف الإداري إذا كان حظر إداري' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  suppressedByAdmin?: Types.ObjectId;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSuppressionSchema = SchemaFactory.createForClass(
  NotificationSuppression,
);

// ==================== Indexes ====================
// البحث السريع حسب المستخدم
NotificationSuppressionSchema.index({ userId: 1 });

// البحث حسب المستخدم والقناة
NotificationSuppressionSchema.index({ userId: 1, suppressedChannels: 1 });

// البحث عن الحظر النشط فقط
NotificationSuppressionSchema.index({ userId: 1, isActive: 1 });

// البحث حسب تاريخ الانتهاء (للـ cleanup)
NotificationSuppressionSchema.index({ expiresAt: 1 }, { sparse: true });

// Compound index للأداء الأفضل
NotificationSuppressionSchema.index({
  userId: 1,
  isActive: 1,
  expiresAt: 1,
});
