import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DLQJob } from '../entities/dlq-job.entity';

export interface DLQJobData {
  originalQueue: string;
  jobId: string;
  jobData: any;
  failedReason: string;
  failedAt: Date;
  retryCount: number;
}

@Injectable()
export class DLQService {
  private readonly logger = new Logger(DLQService.name);

  constructor(
    @InjectModel(DLQJob.name) private dlqJobModel: Model<DLQJob>,
  ) {}

  /**
   * Record failed job in DLQ (database only)
   */
  async moveToDLQ(queueName: string, job: any, error: Error): Promise<void> {
    try {
      const dlqData: DLQJobData = {
        originalQueue: queueName,
        jobId: job.id || `job_${Date.now()}`,
        jobData: job.data,
        failedReason: error.message,
        failedAt: new Date(),
        retryCount: job.attemptsMade || 0,
      };

      // Store in database for tracking only
      await this.dlqJobModel.create(dlqData);

      this.logger.log(`Job ${job.id} from ${queueName} recorded in DLQ: ${error.message}`);

      // Send alert for manual review
      await this.sendDLQAlert(dlqData);
    } catch (dlqError) {
      this.logger.error(`Failed to record job in DLQ: ${dlqError.message}`);
    }
  }

  /**
   * Retry failed jobs from DLQ
   */
  async retryFailedJobs(queueName?: string): Promise<number> {
    const query = queueName ? { originalQueue: queueName } : {};

    const failedJobs = await this.dlqJobModel.find(query).limit(10);

    let retryCount = 0;
    for (const dlqJob of failedJobs) {
      try {
        // Here you would implement retry logic based on queueName
        // For now, just mark as retried
        await this.dlqJobModel.updateOne(
          { _id: dlqJob._id },
          { retryCount: (dlqJob.retryCount || 0) + 1 }
        );

        retryCount++;
        this.logger.log(`Retried DLQ job: ${dlqJob.jobId}`);
      } catch (error) {
        this.logger.error(`Retry failed for DLQ job: ${dlqJob.jobId}`, error);
      }
    }

    return retryCount;
  }

  /**
   * Get DLQ statistics
   */
  async getDLQStats(): Promise<any> {
    const stats = await this.dlqJobModel.aggregate([
      {
        $group: {
          _id: '$originalQueue',
          count: { $sum: 1 },
          oldestFailed: { $min: '$failedAt' }
        }
      }
    ]);

    return {
      totalFailed: await this.dlqJobModel.countDocuments(),
      byQueue: stats,
      summary: {
        totalFailed: stats.reduce((sum, queue) => sum + queue.count, 0),
        oldestFailed: stats.length > 0 ?
          stats.reduce((oldest, queue) =>
            !oldest || queue.oldestFailed < oldest ? queue.oldestFailed : oldest,
            null
          ) : null
      }
    };
  }

  /**
   * Cleanup old DLQ entries
   */
  async cleanupDLQ(cutoffDate: Date): Promise<number> {
    const result = await this.dlqJobModel.deleteMany({
      failedAt: { $lt: cutoffDate }
    });

    this.logger.log(`Cleaned up ${result.deletedCount} old DLQ entries`);
    return result.deletedCount;
  }

  /**
   * Send alert for DLQ job
   */
  private async sendDLQAlert(dlqData: DLQJobData): Promise<void> {
    // Here you would send alerts to monitoring systems
    // For now, just log it
    this.logger.warn(`DLQ Alert: Job ${dlqData.jobId} failed in ${dlqData.originalQueue}: ${dlqData.failedReason}`);
  }
}