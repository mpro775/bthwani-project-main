import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue('emails') private emailQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('orders') private orderQueue: Queue,
  ) {
    super();
  }

  /**
   * فحص صحة قوائم الانتظار (Queues)
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const queues = [
        { name: 'email', queue: this.emailQueue },
        { name: 'notification', queue: this.notificationQueue },
        { name: 'order', queue: this.orderQueue },
      ];

      const queueStatuses = await Promise.all(
        queues.map(async ({ name, queue }) => {
          try {
            // التحقق من الاتصال بـ Redis (التي تستخدمها Bull)
            const isConnected = await queue.isReady();

            // الحصول على عدد المهام
            const jobCounts = await queue.getJobCounts();

            return {
              name,
              connected: isConnected,
              waiting: jobCounts.waiting,
              active: jobCounts.active,
              completed: jobCounts.completed,
              failed: jobCounts.failed,
              delayed: jobCounts.delayed,
              paused: jobCounts.delayed,
              status: isConnected ? 'up' : 'down',
            };
          } catch (error) {
            return {
              name,
              connected: false,
              error: (error as Error).message,
              status: 'down',
            };
          }
        }),
      );

      // التحقق من أن جميع القوائم متصلة
      const allHealthy = queueStatuses.every((q) => q.connected);

      if (allHealthy) {
        return this.getStatus(key, true, {
          queues: queueStatuses,
          totalQueues: queues.length,
          status: 'all queues operational',
        });
      } else {
        const downQueues = queueStatuses
          .filter((q) => !q.connected)
          .map((q) => q.name);
        const result = this.getStatus(key, false, {
          queues: queueStatuses,
          downQueues,
          message: `Some queues are down: ${downQueues.join(', ')}`,
        });
        throw new HealthCheckError('Queue health check failed', result);
      }
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }

      const result = this.getStatus(key, false, {
        message: (error as Error).message || 'Queue health check failed',
        status: 'error',
      });
      throw new HealthCheckError('Queue health check failed', result);
    }
  }

  /**
   * فحص تراكم المهام في القوائم
   */
  async checkBacklog(
    key: string,
    maxWaiting: number = 1000,
  ): Promise<HealthIndicatorResult> {
    try {
      const queues = [
        { name: 'email', queue: this.emailQueue },
        { name: 'notification', queue: this.notificationQueue },
        { name: 'order', queue: this.orderQueue },
      ];

      const queueBacklogs = await Promise.all(
        queues.map(async ({ name, queue }) => {
          const jobCounts = await queue.getJobCounts();
          return {
            name,
            waiting: jobCounts.waiting,
            active: jobCounts.active,
            failed: jobCounts.failed,
            hasBacklog: jobCounts.waiting > maxWaiting,
          };
        }),
      );

      const hasBacklog = queueBacklogs.some((q) => q.hasBacklog);

      if (!hasBacklog) {
        return this.getStatus(key, true, {
          queues: queueBacklogs,
          threshold: maxWaiting,
          status: 'no backlog',
        });
      } else {
        const backlogQueues = queueBacklogs.filter((q) => q.hasBacklog);
        return this.getStatus(key, false, {
          queues: queueBacklogs,
          backlogQueues,
          threshold: maxWaiting,
          message: `Backlog detected in: ${backlogQueues.map((q) => q.name).join(', ')}`,
          status: 'backlog',
        });
      }
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: (error as Error).message || 'Queue backlog check failed',
        status: 'error',
      });
      throw new HealthCheckError('Queue backlog check failed', result);
    }
  }

  /**
   * فحص المهام الفاشلة
   */
  async checkFailedJobs(
    key: string,
    maxFailed: number = 100,
  ): Promise<HealthIndicatorResult> {
    try {
      const queues = [
        { name: 'email', queue: this.emailQueue },
        { name: 'notification', queue: this.notificationQueue },
        { name: 'order', queue: this.orderQueue },
      ];

      const failedJobs = await Promise.all(
        queues.map(async ({ name, queue }) => {
          const jobCounts = await queue.getJobCounts();
          return {
            name,
            failed: jobCounts.failed,
            exceedsThreshold: jobCounts.failed > maxFailed,
          };
        }),
      );

      const hasExcessiveFailures = failedJobs.some((q) => q.exceedsThreshold);

      if (!hasExcessiveFailures) {
        return this.getStatus(key, true, {
          queues: failedJobs,
          threshold: maxFailed,
          status: 'acceptable failure rate',
        });
      } else {
        const problematicQueues = failedJobs.filter((q) => q.exceedsThreshold);
        return this.getStatus(key, false, {
          queues: failedJobs,
          problematicQueues,
          threshold: maxFailed,
          message: `Excessive failures in: ${problematicQueues.map((q) => q.name).join(', ')}`,
          status: 'high failure rate',
        });
      }
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: (error as Error).message || 'Failed jobs check failed',
        status: 'error',
      });
      throw new HealthCheckError('Failed jobs check failed', result);
    }
  }
}
