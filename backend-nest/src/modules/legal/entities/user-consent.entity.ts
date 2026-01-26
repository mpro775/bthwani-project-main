import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'user_consents' })
export class UserConsent extends Document {
  @ApiProperty({ description: 'معرف المستخدم' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'نوع الموافقة (privacy_policy, terms_of_service)',
  })
  @Prop({
    required: true,
    type: String,
    enum: ['privacy_policy', 'terms_of_service'],
  })
  consentType: string;

  @ApiProperty({ description: 'إصدار المستند المقبول' })
  @Prop({ required: true, type: String })
  version: string;

  @ApiProperty({ description: 'هل تمت الموافقة' })
  @Prop({ type: Boolean, default: true })
  accepted: boolean;

  @ApiProperty({ description: 'عنوان IP عند الموافقة' })
  @Prop({ type: String, required: false })
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent عند الموافقة' })
  @Prop({ type: String, required: false })
  userAgent?: string;

  @ApiProperty({ description: 'تاريخ الموافقة' })
  createdAt: Date;
}

export const UserConsentSchema = SchemaFactory.createForClass(UserConsent);

// إنشاء indexes لتحسين الأداء
UserConsentSchema.index({ userId: 1, consentType: 1, version: 1 });
UserConsentSchema.index({ consentType: 1, accepted: 1 });
