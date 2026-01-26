import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  // إنشاء إشعار
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationModel.create(
      createNotificationDto,
    );
    return notification;
  }

  // جلب إشعارات المستخدم
  async getUserNotifications(userId: string, pagination: CursorPaginationDto) {
    const query: Record<string, any> = { toUser: userId };

    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items: Notification[] = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const results: Notification[] = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as unknown as {
                _id?: { toString: () => string };
              }
            )._id?.toString() || null
          : null,
        hasMore,
        limit,
      },
    };
  }

  // تحديث حالة الإشعار
  async markAsRead(notificationId: string) {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { status: 'delivered' },
      { new: true },
    );

    return notification;
  }

  // حذف إشعار
  async delete(notificationId: string) {
    await this.notificationModel.findByIdAndDelete(notificationId);
    return { message: 'تم حذف الإشعار' };
  }

  // عدد الإشعارات غير المقروءة
  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      toUser: userId,
      status: { $ne: 'delivered' },
    });

    return { count };
  }

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { toUser: userId, status: { $ne: 'delivered' } },
      { status: 'delivered' },
    );

    return { message: 'تم تحديد جميع الإشعارات كمقروءة' };
  }
}
