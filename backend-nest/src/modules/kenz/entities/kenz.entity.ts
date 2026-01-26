import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Kenz extends Document {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'السعر', required: false, example: 3500 })
  @Prop()
  price?: number;

  @ApiProperty({ description: 'الفئة', required: false, example: 'إلكترونيات' })
  @Prop()
  category?: string;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'فضي', storage: '256GB' } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', enum: KenzStatus, default: KenzStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: KenzStatus;
}

export const KenzSchema = SchemaFactory.createForClass(Kenz);
