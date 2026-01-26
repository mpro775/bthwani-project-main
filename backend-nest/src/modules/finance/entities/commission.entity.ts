import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Commission extends Document {
  @Prop({ required: true, type: Types.ObjectId, refPath: 'entityModel' })
  entityId: Types.ObjectId; // Order, Vendor, etc.

  @Prop({ required: true, enum: ['Order', 'Vendor', 'Driver', 'Marketer'] })
  entityModel: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  beneficiary: Types.ObjectId; // من يستحق العمولة

  @Prop({ required: true, enum: ['driver', 'vendor', 'marketer', 'company'] })
  beneficiaryType: string;

  @Prop({ required: true })
  amount: number; // مبلغ العمولة

  @Prop({ required: true })
  rate: number; // نسبة العمولة (مثلاً 10 = 10%)

  @Prop({ required: true })
  baseAmount: number; // المبلغ الأساسي الذي حُسبت منه العمولة

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  calculationType: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'PayoutBatch' })
  payoutBatch?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  notes?: string;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

// Indexes
CommissionSchema.index({ entityId: 1, entityModel: 1 });
CommissionSchema.index({ beneficiary: 1, status: 1 });
CommissionSchema.index({ status: 1, createdAt: -1 });
CommissionSchema.index({ payoutBatch: 1 });
