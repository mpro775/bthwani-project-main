import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket } from '../../support/entities/support-ticket.entity';

@Injectable()
export class SupportAdminService {
  constructor(
    @InjectModel(SupportTicket.name)
    private supportTicketModel: Model<SupportTicket>,
  ) {}

  async getSupportTickets(
    status?: string,
    priority?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const matchQuery: Record<string, any> = {};
    if (status) matchQuery.status = status;
    if (priority) matchQuery.priority = priority;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.supportTicketModel
        .find(matchQuery)
        .populate('userId', 'fullName phone email')
        .populate('assignedTo', 'fullName email')
        .populate('resolvedBy', 'fullName')
        .skip(skip)
        .limit(limit)
        .sort({ priority: -1, createdAt: -1 }),
      this.supportTicketModel.countDocuments(matchQuery),
    ]);

    return {
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async assignTicket(ticketId: string, assigneeId: string, adminId: string) {
    const ticket = await this.supportTicketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    ticket.assignedTo = new Types.ObjectId(assigneeId);
    ticket.assignedAt = new Date();
    ticket.status = 'assigned';

    ticket.messages.push({
      message: `تم تعيين التذكرة`,
      sender: new Types.ObjectId(adminId),
      senderModel: 'User',
      createdAt: new Date(),
    });

    await ticket.save();

    return { success: true, message: 'تم تعيين التذكرة' };
  }

  async resolveTicket(ticketId: string, resolution: string, adminId: string) {
    const ticket = await this.supportTicketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      throw new BadRequestException({
        code: 'TICKET_ALREADY_RESOLVED',
        userMessage: 'التذكرة محلولة بالفعل',
      });
    }

    ticket.status = 'resolved';
    ticket.resolution = resolution;
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = new Types.ObjectId(adminId);

    if (ticket.createdAt) {
      ticket.resolutionTime = Math.round(
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 60000,
      );
    }

    ticket.messages.push({
      message: `تم حل التذكرة: ${resolution}`,
      sender: new Types.ObjectId(adminId),
      senderModel: 'User',
      createdAt: new Date(),
    });

    await ticket.save();

    return { success: true, message: 'تم حل التذكرة' };
  }

  async getSupportStats({ startDate, endDate }: {
    startDate?: string;
    endDate?: string;
  }) {
    const matchQuery: any = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await this.supportTicketModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTickets = stats.reduce((sum, stat) => sum + stat.count, 0);

    return {
      totalTickets,
      byStatus: stats,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };
  }

  async getSLAMetrics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await this.supportTicketModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
          resolvedAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgResolutionTime: { $avg: '$resolutionTime' },
          totalResolved: { $sum: 1 },
          breachedSLA: {
            $sum: { $cond: ['$slaBreached', 1, 0] },
          },
        },
      },
    ]);

    return {
      averageResponseTime: metrics[0]?.avgResponseTime || 0,
      averageResolutionTime: metrics[0]?.avgResolutionTime || 0,
      breachedSLA: metrics[0]?.breachedSLA || 0,
      totalResolved: metrics[0]?.totalResolved || 0,
    };
  }
}

