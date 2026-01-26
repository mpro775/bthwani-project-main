import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket } from './entities/support-ticket.entity';
import {
  CreateTicketDto,
  GetTicketsQueryDto,
  AssignTicketDto,
  AddMessageDto,
  ResolveTicketDto,
  RateTicketDto,
} from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private ticketModel: Model<SupportTicket>,
  ) {}

  async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    const ticket = new this.ticketModel(dto);
    return await ticket.save();
  }

  async getTickets(query: GetTicketsQueryDto) {
    const matchQuery: Record<string, any> = {};

    if (query.status) matchQuery.status = query.status;
    if (query.priority) matchQuery.priority = query.priority;
    if (query.assignedTo) matchQuery.assignedTo = new Types.ObjectId(query.assignedTo);

    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.ticketModel
        .find(matchQuery)
        .populate('userId', 'fullName phone email')
        .populate('assignedTo', 'fullName email')
        .populate('resolvedBy', 'fullName')
        .skip(skip)
        .limit(limit)
        .sort({ priority: -1, createdAt: -1 }),
      this.ticketModel.countDocuments(matchQuery),
    ]);

    return {
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketModel
      .findById(id)
      .populate('userId', 'fullName phone email')
      .populate('assignedTo', 'fullName email')
      .populate('resolvedBy', 'fullName')
      .populate('messages.sender', 'fullName');

    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    return ticket;
  }

  async assignTicket(
    ticketId: string,
    dto: AssignTicketDto,
    adminId: string,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    ticket.assignedTo = new Types.ObjectId(dto.assigneeId);
    ticket.assignedAt = new Date();
    ticket.status = 'assigned';

    // Add system message
    ticket.messages.push({
      message: `تم تعيين التذكرة`,
      sender: new Types.ObjectId(adminId),
      senderModel: 'User',
      createdAt: new Date(),
    });

    return await ticket.save();
  }

  async addMessage(
    ticketId: string,
    dto: AddMessageDto,
    userId: string,
    userModel: string,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    const message = {
      message: dto.message,
      sender: new Types.ObjectId(userId),
      senderModel: userModel,
      createdAt: new Date(),
      attachments: dto.attachments,
    };

    ticket.messages.push(message);

    // Track first response time
    if (!ticket.firstResponseAt && userModel === 'User') {
      ticket.firstResponseAt = new Date();
      ticket.responseTime = Math.round(
        (ticket.firstResponseAt.getTime() - ticket.createdAt!.getTime()) / 60000,
      );
    }

    // Update status if needed
    if (userModel === 'User' && ticket.status === 'pending-user') {
      ticket.status = 'in-progress';
    } else if (userModel !== 'User' && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    return await ticket.save();
  }

  async resolveTicket(
    ticketId: string,
    dto: ResolveTicketDto,
    adminId: string,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(ticketId);
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
    ticket.resolution = dto.resolution;
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = new Types.ObjectId(adminId);

    // Calculate resolution time
    if (ticket.createdAt) {
      ticket.resolutionTime = Math.round(
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 60000,
      );
    }

    // Add resolution message
    ticket.messages.push({
      message: `تم حل التذكرة: ${dto.resolution}`,
      sender: new Types.ObjectId(adminId),
      senderModel: 'User',
      createdAt: new Date(),
    });

    return await ticket.save();
  }

  async closeTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();

    return await ticket.save();
  }

  async rateTicket(
    ticketId: string,
    dto: RateTicketDto,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        userMessage: 'التذكرة غير موجودة',
      });
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new BadRequestException({
        code: 'TICKET_NOT_RESOLVED',
        userMessage: 'لا يمكن تقييم تذكرة غير محلولة',
      });
    }

    ticket.rating = dto.rating;
    ticket.feedback = dto.feedback;

    return await ticket.save();
  }

  async getSLAMetrics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await this.ticketModel.aggregate([
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

    const openTickets = await this.ticketModel.countDocuments({
      status: { $in: ['open', 'assigned', 'in-progress'] },
    });

    return {
      averageResponseTime: metrics[0]?.avgResponseTime || 0,
      averageResolutionTime: metrics[0]?.avgResolutionTime || 0,
      breachedSLA: metrics[0]?.breachedSLA || 0,
      totalResolved: metrics[0]?.totalResolved || 0,
      openTickets,
    };
  }

  async getTicketStats() {
    const stats = await this.ticketModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byPriority = await this.ticketModel.aggregate([
      {
        $match: { status: { $in: ['open', 'assigned', 'in-progress'] } },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      byStatus: stats,
      byPriority,
    };
  }
}

