import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface TicketMessage {
  message: string;
  sender: Types.ObjectId;
  senderModel: string;
  createdAt: Date;
  attachments?: string[];
}

@Schema({ timestamps: true, collection: 'support_tickets' })
export class SupportTicket extends Document {
  @Prop({ required: true, unique: true, type: String })
  ticketNumber: string;

  @Prop({ type: Types.ObjectId, refPath: 'userModel' })
  userId?: Types.ObjectId;

  @Prop({ enum: ['User', 'Driver', 'Vendor'], type: String })
  userModel?: string;

  @Prop({ required: true, type: String })
  subject: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    type: String,
  })
  priority: string;

  @Prop({
    required: true,
    enum: [
      'open',
      'assigned',
      'in-progress',
      'pending-user',
      'resolved',
      'closed',
      'cancelled',
    ],
    default: 'open',
    type: String,
  })
  status: string;

  @Prop({
    required: true,
    enum: [
      'technical',
      'payment',
      'account',
      'order',
      'general',
      'complaint',
      'feedback',
    ],
    type: String,
  })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({
    type: [
      {
        message: String,
        sender: { type: Types.ObjectId, ref: 'User' },
        senderModel: String,
        createdAt: Date,
        attachments: [String],
      },
    ],
    default: [],
  })
  messages: TicketMessage[];

  @Prop({ type: String })
  resolution?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop({ type: String })
  feedback?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  relatedOrder?: Types.ObjectId;

  // SLA tracking
  @Prop({ type: Date })
  firstResponseAt?: Date;

  @Prop({ type: Number, default: 0 })
  responseTime: number; // in minutes

  @Prop({ type: Number, default: 0 })
  resolutionTime: number; // in minutes

  @Prop({ type: Boolean, default: false })
  slaBreached: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SupportTicketSchema =
  SchemaFactory.createForClass(SupportTicket);

// Indexes for performance
SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ status: 1, priority: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ category: 1, status: 1 });
SupportTicketSchema.index({ createdAt: -1 });

// Generate ticket number before saving
SupportTicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.ticketNumber = `ST-${dateStr}-${random}`;
  }
  next();
});

