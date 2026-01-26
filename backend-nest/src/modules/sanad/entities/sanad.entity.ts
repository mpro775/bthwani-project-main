import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum SanadKind {
  SPECIALIST = 'specialist',
  EMERGENCY = 'emergency',
  CHARITY = 'charity'
}

export enum SanadStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Sanad extends Document {
  @ApiProperty({ description: 'معرف صاحب الطلب', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان الطلب', example: 'طلب فزعة لإسعاف عاجل' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل الطلب', required: false, example: 'حالة طبية تحتاج نقل عاجل' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'نوع الطلب', required: false, enum: SanadKind, example: SanadKind.EMERGENCY })
  @Prop()
  kind?: SanadKind;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { location: 'الرياض', contact: '+9665XXXXXXX' } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة الطلب', enum: SanadStatus, default: SanadStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: SanadStatus;
}

export const SanadSchema = SchemaFactory.createForClass(Sanad);
