import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Es3afniDonor extends Document {
  @ApiProperty({ description: 'معرف المستخدم', type: 'string' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'فصيلة الدم', example: 'O+' })
  @Prop({ required: true })
  bloodType: string;

  @ApiProperty({ description: 'تاريخ آخر تبرع', required: false })
  @Prop({ type: Date })
  lastDonation?: Date;

  @ApiProperty({ description: 'متاح للتبرع الآن', default: true })
  @Prop({ default: true })
  available: boolean;

  @ApiProperty({ description: 'الموقع (مدينة أو محافظة)', required: false })
  @Prop()
  city?: string;

  @ApiProperty({ description: 'المحافظة', required: false })
  @Prop()
  governorate?: string;

  @ApiProperty({
    description: 'الموقع بالإحداثيات',
    required: false,
    example: { lat: 24.7136, lng: 46.6753, address: 'الرياض' },
  })
  @Prop({ type: Object })
  location?: { lat: number; lng: number; address?: string };

  @ApiProperty({ description: 'GeoJSON للبحث الجغرافي', required: false })
  @Prop({
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],
  })
  locationGeo?: { type: 'Point'; coordinates: [number, number] };
}

export const Es3afniDonorSchema = SchemaFactory.createForClass(Es3afniDonor);

Es3afniDonorSchema.index({ userId: 1 }, { unique: true });
Es3afniDonorSchema.index({ bloodType: 1, available: 1 });
Es3afniDonorSchema.index({ locationGeo: '2dsphere' });
