import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AmaniDriverAssignedEvent } from '../amani-driver-assigned.event';
import { AmaniStatusChangedEvent } from '../amani-status-changed.event';
import { AmaniGateway } from '../../../../gateways/amani.gateway';

@Injectable()
export class AmaniNotificationHandler {
  private readonly logger = new Logger(AmaniNotificationHandler.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    private amaniGateway: AmaniGateway,
  ) {}

  @OnEvent('amani.driver.assigned')
  async handleDriverAssigned(event: AmaniDriverAssignedEvent) {
    this.logger.log(
      `Driver ${event.driverId} assigned to amani ${event.amaniId}`,
    );

    // بث عبر WebSocket
    this.amaniGateway.broadcastDriverAssigned(event.amaniId, event.driverId);

    // إرسال إشعار للعميل
    await this.notificationQueue.add('send-notification', {
      userId: event.ownerId,
      title: 'تم تعيين سائق لطلبك',
      body: 'تم تعيين سائق لطلب النقل النسائي الخاص بك',
      type: 'amani',
      data: {
        amaniId: event.amaniId,
        driverId: event.driverId,
        action: 'driver_assigned',
      },
    });

    // إرسال إشعار للسائق
    await this.notificationQueue.add('send-notification', {
      userId: event.driverId,
      title: 'تم تعيينك لطلب نقل نسائي',
      body: 'تم تعيينك لطلب نقل نسائي جديد',
      type: 'amani',
      data: {
        amaniId: event.amaniId,
        action: 'new_assignment',
      },
    });
  }

  @OnEvent('amani.status.changed')
  async handleStatusChanged(event: AmaniStatusChangedEvent) {
    this.logger.log(
      `Amani ${event.amaniId} status changed from ${event.oldStatus} to ${event.newStatus}`,
    );

    // بث عبر WebSocket
    this.amaniGateway.broadcastStatusUpdate(event.amaniId, event.newStatus);

    // رسائل الحالة
    const statusMessages: Record<string, string> = {
      pending: 'طلبك في انتظار الموافقة',
      confirmed: 'تم تأكيد طلبك',
      in_progress: 'السائق في الطريق',
      completed: 'تم إكمال الرحلة بنجاح',
      cancelled: 'تم إلغاء طلبك',
    };

    const message = statusMessages[event.newStatus] || 'تم تحديث حالة طلبك';

    // جلب بيانات الطلب لإرسال الإشعار للعميل والسائق
    // TODO: Inject AmaniService to get order details
    // For now, we'll send a generic notification
    await this.notificationQueue.add('send-notification', {
      title: 'تحديث حالة الطلب',
      body: message,
      type: 'amani',
      data: {
        amaniId: event.amaniId,
        status: event.newStatus,
        oldStatus: event.oldStatus,
        action: 'status_changed',
      },
    });
  }
}
