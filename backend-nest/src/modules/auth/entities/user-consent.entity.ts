import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'user_consents' })
export class UserConsent extends Document {
  @ApiProperty({ description: 'معرف المستخدم' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'نوع الموافقة',
    enum: [
      'privacy_policy',
      'terms_of_service',
      'marketing',
      'data_processing',
    ],
  })
  @Prop({
    type: String,
    enum: [
      'privacy_policy',
      'terms_of_service',
      'marketing',
      'data_processing',
    ],
    required: true,
    index: true,
  })
  consentType: string;

  @ApiProperty({ description: 'حالة الموافقة' })
  @Prop({ type: Boolean, required: true })
  granted: boolean;

  @ApiProperty({ description: 'نسخة السياسة أو الشروط' })
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty({ description: 'تاريخ الموافقة' })
  @Prop({ type: Date, default: Date.now })
  consentDate: Date;

  @ApiProperty({ description: 'عنوان IP للمستخدم' })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent للمتصفح' })
  @Prop({ type: String })
  userAgent?: string;

  @ApiProperty({ description: 'تاريخ سحب الموافقة (إن وُجد)' })
  @Prop({ type: Date })
  withdrawnAt?: Date;

  @ApiProperty({ description: 'ملاحظات إضافية' })
  @Prop({ type: String })
  notes?: string;

  // Timestamps (من timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserConsentSchema = SchemaFactory.createForClass(UserConsent);

// ==================== Indexes ====================
// مركّب: البحث حسب المستخدم ونوع الموافقة
UserConsentSchema.index({ userId: 1, consentType: 1 });

// للبحث عن آخر موافقة لمستخدم معين
UserConsentSchema.index({ userId: 1, consentDate: -1 });

// للبحث عن الموافقات النشطة (غير المسحوبة)
UserConsentSchema.index({
  userId: 1,
  consentType: 1,
  granted: 1,
  withdrawnAt: 1,
});

// للتدقيق: البحث حسب التاريخ
UserConsentSchema.index({ createdAt: -1 });
