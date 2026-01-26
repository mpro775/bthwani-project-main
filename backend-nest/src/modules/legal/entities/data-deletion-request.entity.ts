import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface DeletionSummary {
  ordersDeleted: number;
  transactionsAnonymized: number;
  filesDeleted: number;
  relationsRemoved: number;
}

export interface VerificationData {
  code: string;
  verified: boolean;
  verifiedAt?: Date;
}

@Schema({ timestamps: true, collection: 'data_deletion_requests' })
export class DataDeletionRequest extends Document {
  @Prop({ required: true, unique: true, type: String })
  requestNumber: string; // DDR-YYYYMMDD-XXXX

  @Prop({ type: Types.ObjectId, refPath: 'userModel', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['User', 'Driver', 'Vendor'], type: String })
  userModel: string;

  @Prop({ required: true, type: String })
  userEmail: string;

  @Prop({ required: true, type: String })
  userPhone: string;

  @Prop({
    required: true,
    enum: [
      'pending',
      'under-review',
      'approved',
      'rejected',
      'processing',
      'completed',
    ],
    default: 'pending',
    type: String,
  })
  status: string;

  @Prop({ required: true, type: String })
  reason: string;

  @Prop({ type: [String], default: [] })
  dataTypes: string[]; // ['personal_info', 'orders', 'transactions', 'all']

  @Prop({ type: Boolean, default: false })
  hardDelete: boolean; // true = حذف نهائي، false = soft delete

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: String })
  reviewNotes?: string;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  scheduledDeletionDate?: Date; // تاريخ الحذف المجدول (بعد فترة سماح)

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  @Prop({
    type: {
      ordersDeleted: Number,
      transactionsAnonymized: Number,
      filesDeleted: Number,
      relationsRemoved: Number,
    },
  })
  deletionSummary?: DeletionSummary;

  @Prop({ type: [String], default: [] })
  backupFiles: string[]; // روابط النسخ الاحتياطية قبل الحذف

  @Prop({ type: Boolean, default: false })
  notificationSent: boolean;

  @Prop({
    type: {
      code: String,
      verified: Boolean,
      verifiedAt: Date,
    },
  })
  verificationData?: VerificationData;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DataDeletionRequestSchema = SchemaFactory.createForClass(
  DataDeletionRequest,
);

// Indexes
DataDeletionRequestSchema.index({ requestNumber: 1 }, { unique: true });
DataDeletionRequestSchema.index({ userId: 1, status: 1 });
DataDeletionRequestSchema.index({ status: 1, createdAt: 1 });
DataDeletionRequestSchema.index({ scheduledDeletionDate: 1 });

// Generate request number before saving
DataDeletionRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.requestNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.requestNumber = `DDR-${dateStr}-${random}`;
  }
  next();
});

