import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHmac } from 'crypto';
import { WebhookDelivery, WebhookDeliverySchema } from '../entities/webhook-delivery.entity';
import { WebhookEvent } from '../entities/webhook-event.entity';

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  webhookId: string;
}

export interface WebhookSignature {
  signature: string;
  algorithm: string;
  timestamp: number;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly SIGNATURE_TOLERANCE = 300000; // 5 minutes in milliseconds

  constructor(
    @InjectModel(WebhookDelivery.name) private webhookDeliveryModel: Model<WebhookDelivery>,
    @InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEvent>,
  ) {}

  /**
   * Generate webhook signature using HMAC-SHA256
   */
  generateSignature(payload: WebhookPayload, secret: string): WebhookSignature {
    const timestamp = payload.timestamp || Date.now();
    const message = `${timestamp}.${JSON.stringify(payload)}`;

    const signature = createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    return {
      signature: `sha256=${signature}`,
      algorithm: 'sha256',
      timestamp,
    };
  }

  /**
   * Verify webhook signature and prevent replay attacks
   */
  async verifyAndProcessWebhook(
    payload: WebhookPayload,
    signature: string,
    secret: string,
    webhookId: string,
  ): Promise<WebhookDelivery> {
    // Verify signature
    const isValidSignature = this.verifySignature(payload, signature, secret);
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Check timestamp tolerance (prevent replay attacks)
    const now = Date.now();
    const timeDiff = Math.abs(now - payload.timestamp);
    if (timeDiff > this.SIGNATURE_TOLERANCE) {
      throw new BadRequestException('Webhook timestamp outside tolerance window');
    }

    // Check for replay attack (duplicate event processing)
    const existingDelivery = await this.webhookDeliveryModel.findOne({
      webhookId: payload.webhookId,
      eventId: payload.data?.id || payload.event,
      processedAt: { $exists: true },
    });

    if (existingDelivery) {
      throw new BadRequestException('Webhook event already processed (replay attack detected)');
    }

    // Create delivery record
    const delivery = await this.webhookDeliveryModel.create({
      webhookId,
      eventType: payload.event,
      payload: payload.data,
      signature,
      status: 'processing',
      attempts: 1,
      deliveredAt: new Date(),
    });

    try {
      // Process webhook directly
      await this.processWebhookEventDirectly(payload);

      // Mark as delivered
      await this.webhookDeliveryModel.updateOne(
        { _id: delivery._id },
        {
          status: 'delivered',
          processedAt: new Date(),
          responseCode: 200,
        }
      );

      this.logger.log(`Webhook ${webhookId} processed: ${payload.event}`);
      return delivery;
    } catch (error) {
      // Mark as failed
      await this.webhookDeliveryModel.updateOne(
        { _id: delivery._id },
        {
          status: 'failed',
          errorMessage: error.message,
          responseCode: 500,
        }
      );

      this.logger.error(`Webhook ${webhookId} queueing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify HMAC signature
   */
  private verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    try {
      const timestamp = payload.timestamp;
      const message = `${timestamp}.${JSON.stringify(payload)}`;

      const expectedSignature = createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      return providedSignature === expectedSignature;
    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Process webhook event based on type (for direct processing)
   */
  async processWebhookEventDirectly(payload: WebhookPayload): Promise<void> {
    // Store the event
    await this.webhookEventModel.create({
      eventType: payload.event,
      payload: payload.data,
      webhookId: payload.webhookId,
      receivedAt: new Date(),
      processed: true,
    });

    // Handle different event types
    switch (payload.event) {
      case 'order.created':
        await this.handleOrderCreated(payload.data);
        break;
      case 'payment.completed':
        await this.handlePaymentCompleted(payload.data);
        break;
      case 'user.registered':
        await this.handleUserRegistered(payload.data);
        break;
      case 'driver.assigned':
        await this.handleDriverAssigned(payload.data);
        break;
      default:
        this.logger.warn(`Unknown webhook event type: ${payload.event}`);
    }
  }

  /**
   * Handle order created event
   */
  private async handleOrderCreated(data: any): Promise<void> {
    this.logger.log(`Processing order created: ${data.orderId}`);
    // Business logic for order creation
    // e.g., send notifications, update analytics, etc.
  }

  /**
   * Handle payment completed event
   */
  private async handlePaymentCompleted(data: any): Promise<void> {
    this.logger.log(`Processing payment completed: ${data.paymentId}`);
    // Business logic for payment completion
    // e.g., update wallet, send receipts, etc.
  }

  /**
   * Handle user registered event
   */
  private async handleUserRegistered(data: any): Promise<void> {
    this.logger.log(`Processing user registered: ${data.userId}`);
    // Business logic for user registration
    // e.g., send welcome emails, create profiles, etc.
  }

  /**
   * Handle driver assigned event
   */
  private async handleDriverAssigned(data: any): Promise<void> {
    this.logger.log(`Processing driver assigned: ${data.orderId} -> ${data.driverId}`);
    // Business logic for driver assignment
    // e.g., notify user, update order status, etc.
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookHistory(webhookId?: string, limit: number = 50): Promise<WebhookDelivery[]> {
    const query = webhookId ? { webhookId } : {};
    return this.webhookDeliveryModel
      .find(query)
      .sort({ deliveredAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Retry failed webhook deliveries
   */
  async retryFailedDeliveries(webhookId?: string): Promise<number> {
    const query = {
      status: 'failed',
      ...(webhookId && { webhookId }),
    };

    const failedDeliveries = await this.webhookDeliveryModel.find(query);

    let retryCount = 0;
    for (const delivery of failedDeliveries) {
      try {
        // Reconstruct payload for retry
        const payload: WebhookPayload = {
          event: delivery.eventType,
          data: delivery.payload,
          timestamp: delivery.deliveredAt.getTime(),
          webhookId: delivery.webhookId,
        };

        // Retry processing (without signature verification for retries)
        await this.processWebhookEventDirectly(payload);

        // Update delivery status
        await this.webhookDeliveryModel.updateOne(
          { _id: delivery._id },
          {
            status: 'delivered',
            processedAt: new Date(),
            responseCode: 200,
            attempts: (delivery.attempts || 0) + 1,
          }
        );

        retryCount++;
        this.logger.log(`Retried webhook delivery: ${delivery._id}`);
      } catch (error) {
        this.logger.error(`Retry failed for webhook delivery: ${delivery._id}`, error);
      }
    }

    return retryCount;
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    webhookId: string,
    payload: WebhookPayload,
    status: string,
    responseCode: number,
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      responseCode,
      processedAt: new Date(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await this.webhookDeliveryModel.updateOne(
      {
        webhookId,
        eventType: payload.event,
        status: 'processing'
      },
      updateData
    );
  }
}
