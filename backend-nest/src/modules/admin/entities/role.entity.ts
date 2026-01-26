import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'roles' })
export class Role extends Document {
  @Prop({ required: true, unique: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  displayName: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: Object,
    default: {},
    example: {
      'users.view': true,
      'users.create': true,
      'orders.manage': true,
      'reports.view': true
    }
  })
  permissions: Record<string, boolean>;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  users: string[]; // User IDs assigned to this role

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ users: 1 });
