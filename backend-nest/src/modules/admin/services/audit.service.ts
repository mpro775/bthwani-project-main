import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLog>,
  ) {}

  async getAuditLogs(
    action?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const matchQuery: {
      action?: RegExp;
      userId?: Types.ObjectId;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};

    if (action) matchQuery.action = new RegExp(action, 'i');
    if (userId) matchQuery.userId = new Types.ObjectId(userId);

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(matchQuery)
        .populate('userId', 'fullName email role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.auditLogModel.countDocuments(matchQuery),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogDetails(logId: string) {
    const log = await this.auditLogModel
      .findById(logId)
      .populate('userId', 'fullName email role');

    if (!log) {
      throw new NotFoundException({
        code: 'AUDIT_LOG_NOT_FOUND',
        userMessage: 'سجل المراجعة غير موجود',
      });
    }

    return { log };
  }

  async getFlaggedAuditLogs() {
    const logs = await this.auditLogModel
      .find({ flagged: true })
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100);

    return { data: logs, total: logs.length };
  }

  async getAuditLogsByResource(resource: string, resourceId: string) {
    const logs = await this.auditLogModel
      .find({
        resource,
        resourceId: new Types.ObjectId(resourceId),
      })
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(50);

    return { data: logs, total: logs.length };
  }

  async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = new this.auditLogModel(data);
    return await log.save();
  }

  async logAction(data: {
    action: string;
    entityType?: string;
    entityId?: string;
    userId: string;
    resource?: string;
    resourceId?: string;
    details?: any;
  }) {
    const logData: Partial<AuditLog> = {
      action: data.action,
      userId: new Types.ObjectId(data.userId),
      resource: data.resource || data.entityType,
      resourceId: data.resourceId ? new Types.ObjectId(data.resourceId) : (data.entityId ? new Types.ObjectId(data.entityId) : undefined),
      metadata: data.details,
      status: 'success',
      severity: 'low',
    };

    return await this.createAuditLog(logData);
  }

  async getAuditLogsStats(matchConditions: any = {}) {
    const matchQuery = { ...matchConditions };

    const [totalLogs, actionsByType, actionsByUser, recentActivity] = await Promise.all([
      this.auditLogModel.countDocuments(matchQuery),
      this.auditLogModel.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.auditLogModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userName: '$user.fullName',
            count: 1,
            lastActivity: 1,
          },
        },
      ]),
      this.auditLogModel
        .find(matchQuery)
        .populate('userId', 'fullName email')
        .sort({ timestamp: -1 })
        .limit(5),
    ]);

    return {
      totalLogs,
      actionsByType,
      actionsByUser,
      recentActivity,
    };
  }
}
