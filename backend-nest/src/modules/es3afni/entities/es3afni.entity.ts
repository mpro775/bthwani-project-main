import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum Es3afniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Es3afni extends Document {
  @ApiProperty({ description: 'معرف صاحب البلاغ', example: '507f1f77bcf86cd799439011', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'عنوان البلاغ', example: 'حاجة عاجلة لفصيلة O+ في الرياض' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'تفاصيل إضافية', required: false, example: 'المريض بحاجة عاجلة خلال 24 ساعة' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'فصيلة الدم المطلوبة', required: false, example: 'O+' })
  @Prop()
  bloodType?: string;

  @ApiProperty({ description: 'الموقع', required: false, example: { lat: 24.7136, lng: 46.6753, address: 'الرياض' } })
  @Prop({ type: Object })
  location?: any;

  @ApiProperty({ description: 'بيانات إضافية', required: false, example: { contact: '+9665XXXXXXX', unitsNeeded: 3 } })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'حالة البلاغ', enum: Es3afniStatus, default: Es3afniStatus.DRAFT })
  @Prop({ default: 'draft' })
  status: Es3afniStatus;
}

export const Es3afniSchema = SchemaFactory.createForClass(Es3afni);
