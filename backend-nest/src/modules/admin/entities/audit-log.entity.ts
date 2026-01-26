import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: String })
  userEmail?: string;

  @Prop({ type: String })
  userRole?: string;

  @Prop({ required: true, type: String })
  action: string; // e.g., 'user.ban', 'withdrawal.approve', 'settings.update'

  @Prop({ required: true, type: String })
  resource: string; // e.g., 'User', 'Withdrawal', 'Settings'

  @Prop({ type: Types.ObjectId })
  resourceId?: Types.ObjectId;

  @Prop({ type: String })
  method?: string; // GET, POST, PATCH, DELETE

  @Prop({ type: String })
  endpoint?: string; // /admin/users/:id/ban

  @Prop({ type: Object })
  requestBody?: Record<string, any>;

  @Prop({ type: Object })
  previousData?: Record<string, any>; // البيانات قبل التعديل

  @Prop({ type: Object })
  newData?: Record<string, any>; // البيانات بعد التعديل

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({
    enum: ['success', 'failure', 'error'],
    type: String,
    required: true,
  })
  status: string;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // بيانات إضافية

  @Prop({
    enum: ['low', 'medium', 'high', 'critical'],
    type: String,
    required: true,
  })
  severity: string;

  @Prop({ type: Boolean, default: false })
  flagged: boolean; // للأنشطة المشبوهة

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for performance
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ severity: 1, flagged: 1 });
AuditLogSchema.index({ ipAddress: 1 });

// TTL Index - حذف تلقائي بعد سنة (365 يوم)
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000 }, // 365 days
);

