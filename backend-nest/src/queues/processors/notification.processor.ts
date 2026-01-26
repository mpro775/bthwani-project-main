import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

export interface SendNotificationJobData {
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'payment' | 'promo' | 'system';
  data?: Record<string, unknown>;
}

export interface SendBulkNotificationsJobData {
  userIds: string[];
  title: string;
  body: string;
  type: string;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-notification')
  async sendNotification(job: Job<SendNotificationJobData>) {
    this.logger.log(
      `Processing notification job ${job.id} for user ${job.data.userId}`,
    );

    try {
      // TODO: Integrate with Firebase Cloud Messaging or your notification service
      const notification = {
        userId: job.data.userId,
        title: job.data.title,
        body: job.data.body,
        type: job.data.type,
        data: job.data.data,
        sentAt: new Date(),
      };

      // Simulate sending notification
      await this.simulateSendNotification(notification);

      this.logger.log(
        `Notification sent successfully to user ${job.data.userId}`,
      );

      return {
        success: true,
        userId: job.data.userId,
        sentAt: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to send notification: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  @Process('send-bulk-notifications')
  async sendBulkNotifications(job: Job<SendBulkNotificationsJobData>) {
    this.logger.log(
      `Processing bulk notifications for ${job.data.userIds.length} users`,
    );

    const results = {
      total: job.data.userIds.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const userId of job.data.userIds) {
      try {
        await this.simulateSendNotification({
          userId,
          title: job.data.title,
          body: job.data.body,
          type: job.data.type,
          sentAt: new Date(),
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        const err = error as Error;
        results.errors.push(`User ${userId}: ${err.message}`);
        this.logger.error(
          `Failed to send notification to user ${userId}`,
          err.stack,
        );
      }

      // Small delay to avoid overwhelming the service
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.logger.log(
      `Bulk notifications completed: ${results.successful}/${results.total} successful`,
    );
    return results;
  }

  @Process('send-order-update')
  async sendOrderUpdate(
    job: Job<{ orderId: string; status: string; userId: string }>,
  ) {
    this.logger.log(
      `Sending order update notification for order ${job.data.orderId}`,
    );

    const statusMessages: Record<string, string> = {
      confirmed: 'تم تأكيد طلبك',
      preparing: 'جاري تحضير طلبك',
      ready: 'طلبك جاهز للتوصيل',
      picked_up: 'السائق في الطريق',
      delivered: 'تم توصيل طلبك',
      cancelled: 'تم إلغاء طلبك',
    };

    const title = 'تحديث الطلب';
    const body = statusMessages[job.data.status] || 'تم تحديث حالة طلبك';

    return this.sendNotification({
      ...job,
      data: {
        userId: job.data.userId,
        title,
        body,
        type: 'order' as const,
        data: {
          orderId: job.data.orderId,
          status: job.data.status,
        },
      },
    } as unknown as Job<SendNotificationJobData>);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Job ${job.id} completed with result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }

  private async simulateSendNotification(
    notification: Record<string, unknown>,
  ): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with actual notification service integration
    // Example with Firebase:
    // await admin.messaging().send({
    //   token: userFcmToken,
    //   notification: {
    //     title: notification.title,
    //     body: notification.body,
    //   },
    //   data: notification.data,
    // });

    this.logger.debug(`[SIMULATED] Notification sent:`, notification);
  }
}
