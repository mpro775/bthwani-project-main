import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { WebhookService } from '../../modules/notification/services/webhook.service';

export interface WebhookJobData {
  webhookId: string;
  payload: any;
  signature: string;
  secret: string;
  retryCount?: number;
}

@Injectable()
@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);
  private readonly MAX_RETRY_ATTEMPTS = 5;

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<any> {
    const { webhookId, payload, signature, secret, retryCount = 0 } = job.data;

    this.logger.log(`Processing webhook job ${job.id} for webhook ${webhookId}, attempt ${retryCount + 1}`);

    try {
      // Process the webhook event directly (signature already verified)
      await this.webhookService.processWebhookEventDirectly(payload);

      // Find and update delivery record
      await this.webhookService.updateDeliveryStatus(webhookId, payload, 'delivered', 200);

      this.logger.log(`Webhook job ${job.id} completed successfully`);
      return { success: true, webhookId, event: payload.event };

    } catch (error) {
      this.logger.error(`Webhook job ${job.id} failed: ${error.message}`);

      // Check if we should retry
      if (retryCount < this.MAX_RETRY_ATTEMPTS - 1) {
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s, 16s

        await job.updateData({
          ...job.data,
          retryCount: retryCount + 1,
        });

        // Re-queue the job
        await job.retry();

        this.logger.log(`Webhook job ${job.id} scheduled for retry in ${delay}ms`);
        throw error; // This will mark the job as failed but allow retry
      } else {
        // Max retries reached, update delivery status and move to DLQ
        this.logger.error(`Webhook job ${job.id} exhausted all retries, moving to DLQ`);

        // Update delivery status to failed
        await this.webhookService.updateDeliveryStatus(
          webhookId,
          payload,
          'failed',
          500,
          `Max retries exceeded: ${error.message}`
        );

        // Move to dead letter queue
        await this.moveToDLQ(job);

        throw error;
      }
    }
  }

  private async moveToDLQ(job: Job<WebhookJobData>) {
    try {
      // Here you would typically move to a dead letter queue
      // For now, we'll just log and mark as permanently failed
      this.logger.warn(`Moving webhook job ${job.id} to DLQ`);

      // You could also:
      // 1. Send to a separate DLQ queue
      // 2. Store in a separate collection
      // 3. Send alert to operations team
      // 4. Attempt manual processing

      // Example: Store failed webhook for manual review
      await this.storeFailedWebhook(job.data);

    } catch (dlqError) {
      this.logger.error(`Failed to move job ${job.id} to DLQ: ${dlqError.message}`);
    }
  }

  private async storeFailedWebhook(data: WebhookJobData) {
    // Store failed webhook data for manual review
    // This could be implemented as a separate service method
    this.logger.warn(`Storing failed webhook for manual review: ${JSON.stringify(data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<WebhookJobData>) {
    this.logger.log(`Webhook job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<WebhookJobData>, err: Error) {
    this.logger.error(`Webhook job ${job.id} failed permanently: ${err.message}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string, prev: string) {
    this.logger.warn(`Webhook job ${jobId} stalled`);
  }
}

@Injectable()
@Processor('webhooks-dlq')
export class WebhookDLQProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDLQProcessor.name);

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<any> {
    const { webhookId, payload } = job.data;

    this.logger.log(`Processing DLQ webhook job ${job.id} for webhook ${webhookId}`);

    // DLQ processing - could include:
    // 1. Manual review alerts
    // 2. Alternative processing methods
    // 3. Data recovery attempts
    // 4. Notification to developers

    // For now, just log and store for manual review
    this.logger.warn(`DLQ: Webhook ${webhookId} requires manual review`, {
      event: payload.event,
      data: payload.data,
      jobId: job.id,
    });

    // Store in a separate collection for manual review
    // await this.manualReviewService.createReviewRequest(job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<WebhookJobData>) {
    this.logger.log(`DLQ webhook job ${job.id} processed`);
  }
}
