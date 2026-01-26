import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DataDeletionRequest } from '../../legal/entities/data-deletion-request.entity';

@Injectable()
export class DataDeletionService {
  constructor(
    @InjectModel(DataDeletionRequest.name)
    private dataDeletionModel: Model<DataDeletionRequest>,
  ) {}

  async getDataDeletionRequests(status?: string) {
    const matchQuery: Record<string, any> = {};
    if (status) matchQuery.status = status;

    const requests = await this.dataDeletionModel
      .find(matchQuery)
      .populate('userId', 'fullName email phone')
      .populate('approvedBy', 'fullName')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(100);

    return { data: requests, total: requests.length };
  }

  async approveDataDeletion(requestId: string, adminId: string) {
    const request = await this.dataDeletionModel.findById(requestId);
    if (!request) {
      throw new NotFoundException({
        code: 'REQUEST_NOT_FOUND',
        userMessage: 'طلب الحذف غير موجود',
      });
    }

    if (request.status !== 'pending' && request.status !== 'under-review') {
      throw new BadRequestException({
        code: 'REQUEST_ALREADY_PROCESSED',
        userMessage: 'تم معالجة الطلب بالفعل',
      });
    }

    request.status = 'approved';
    request.approvedBy = new Types.ObjectId(adminId);
    request.approvedAt = new Date();

    // Schedule deletion after 30-day grace period
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 30);
    request.scheduledDeletionDate = scheduledDate;

    await request.save();

    // TODO: Send notification to user
    // TODO: Create backup before deletion
    // TODO: Schedule job for actual deletion

    return {
      success: true,
      message: 'تم الموافقة على حذف البيانات. سيتم الحذف بعد 30 يوم',
      scheduledDate: scheduledDate,
    };
  }

  async rejectDataDeletion(requestId: string, reason: string, adminId: string) {
    const request = await this.dataDeletionModel.findById(requestId);
    if (!request) {
      throw new NotFoundException({
        code: 'REQUEST_NOT_FOUND',
        userMessage: 'طلب الحذف غير موجود',
      });
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = new Types.ObjectId(adminId);
    request.reviewedAt = new Date();

    await request.save();

    // TODO: Send notification to user

    return { success: true, message: 'تم رفض طلب الحذف' };
  }

  async getPendingDeletions() {
    const now = new Date();
    const requests = await this.dataDeletionModel
      .find({
        status: 'approved',
        scheduledDeletionDate: { $lte: now },
      })
      .populate('userId', 'fullName email phone')
      .limit(50);

    return { data: requests, total: requests.length };
  }

  async executeDeletion(requestId: string, adminId: string) {
    const request = await this.dataDeletionModel.findById(requestId);
    if (!request) {
      throw new NotFoundException({
        code: 'REQUEST_NOT_FOUND',
        userMessage: 'طلب الحذف غير موجود',
      });
    }

    if (request.status !== 'approved') {
      throw new BadRequestException({
        code: 'REQUEST_NOT_APPROVED',
        userMessage: 'الطلب غير موافق عليه',
      });
    }

    request.status = 'processing';
    await request.save();

    // TODO: Implement actual deletion logic
    // 1. Create backup
    // 2. Delete/anonymize data
    // 3. Update summary
    // 4. Mark as completed

    request.status = 'completed';
    request.deletedAt = new Date();
    request.deletedBy = new Types.ObjectId(adminId);
    request.deletionSummary = {
      ordersDeleted: 0,
      transactionsAnonymized: 0,
      filesDeleted: 0,
      relationsRemoved: 0,
    };

    await request.save();

    return {
      success: true,
      message: 'تم حذف البيانات بنجاح',
      summary: request.deletionSummary,
    };
  }
}
