import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface BackupStats {
  totalDocuments: number;
  totalSize: number;
  collectionsCount: number;
}

@Schema({ timestamps: true, collection: 'backup_records' })
export class BackupRecord extends Document {
  @Prop({ required: true, unique: true, type: String })
  backupId: string; // BACKUP-YYYYMMDD-HHMMSS

  @Prop({
    required: true,
    enum: ['full', 'incremental', 'differential', 'collections'],
    type: String,
  })
  type: string;

  @Prop({ type: [String], default: [] })
  collections: string[]; // إذا كان collections backup

  @Prop({
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending',
    type: String,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, default: 0 })
  size: number; // بالبايت

  @Prop({ type: String })
  path: string; // مسار الملف

  @Prop({ type: String })
  s3Key?: string; // إذا كان في S3

  @Prop({ type: String })
  checksum?: string; // MD5 hash للتحقق من السلامة

  @Prop({ type: Boolean, default: false })
  encrypted: boolean;

  @Prop({ type: String })
  encryptionKey?: string; // encrypted key

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Number, default: 0 })
  duration: number; // seconds

  @Prop({
    type: {
      totalDocuments: Number,
      totalSize: Number,
      collectionsCount: Number,
    },
  })
  stats?: BackupStats;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Date })
  expiresAt?: Date; // تاريخ انتهاء الصلاحية

  @Prop({ type: Boolean, default: false })
  isRestored: boolean;

  @Prop({ type: Date })
  restoredAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  restoredBy?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const BackupRecordSchema = SchemaFactory.createForClass(BackupRecord);

// Indexes
BackupRecordSchema.index({ backupId: 1 }, { unique: true });
BackupRecordSchema.index({ status: 1, createdAt: -1 });
BackupRecordSchema.index({ createdBy: 1 });
BackupRecordSchema.index({ expiresAt: 1 });
BackupRecordSchema.index({ type: 1, status: 1 });
