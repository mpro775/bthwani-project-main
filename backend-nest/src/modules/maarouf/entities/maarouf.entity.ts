import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found'
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Maarouf extends Document {
  @ApiProperty({ description: 'معرف صاحب الإعلان', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'محفظة سوداء مفقودة في منطقة النرجس' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل الإعلان', required: false, example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'نوع الإعلان', required: false, enum: MaaroufKind, example: MaaroufKind.LOST })
  @Prop()
  kind?: MaaroufKind;

  @ApiProperty({ description: 'العلامات', required: false, type: [String], example: ['محفظة', 'بطاقات', 'نرجس'] })
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة الإعلان', enum: MaaroufStatus, default: MaaroufStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: MaaroufStatus;
}

export const MaaroufSchema = SchemaFactory.createForClass(Maarouf);
