import { Controller, Post, Get, Headers, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { WebhookService } from './services/webhook.service';
import type { WebhookPayload } from './services/webhook.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post(':webhookId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive webhook with signature verification',
    description: 'Process incoming webhook with HMAC signature verification and replay attack protection'
  })
  @ApiParam({ name: 'webhookId', description: 'Unique webhook identifier', example: 'wh_123456789' })
  @ApiHeader({
    name: 'X-Webhook-Signature',
    description: 'HMAC signature for payload verification (sha256=...)',
    required: true,
    schema: { type: 'string', example: 'sha256=abc123...' }
  })
  @ApiBody({
    description: 'Webhook payload',
    schema: {
      type: 'object',
      required: ['event', 'data', 'timestamp'],
      properties: {
        event: { type: 'string', example: 'order.created' },
        data: { type: 'object', additionalProperties: true },
        timestamp: { type: 'number', example: 1640995200000 },
        webhookId: { type: 'string', example: 'wh_123456789' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payload or timestamp' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid signature' })
  async receiveWebhook(
    @Param('webhookId') webhookId: string,
    @Body() payload: WebhookPayload,
    @Headers('x-webhook-signature') signature: string,
  ) {
    // Use environment-based secret (in production, each webhookId should have its own secret)
    const secret = process.env.WEBHOOK_SECRET || 'default-webhook-secret-change-in-production';

    return this.webhookService.verifyAndProcessWebhook(payload, signature, secret, webhookId);
  }

  @Get('deliveries')
  @ApiOperation({
    summary: 'Get webhook delivery history',
    description: 'Retrieve webhook delivery history and status'
  })
  @ApiQuery({ name: 'webhookId', description: 'Filter by webhook ID', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of records to return', required: false, example: 50 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Delivery history retrieved' })
  async getDeliveryHistory(
    @Query('webhookId') webhookId?: string,
    @Query('limit') limit?: number,
  ) {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
    return this.webhookService.getWebhookHistory(webhookId, limitNum);
  }

  @Post('deliveries/retry')
  @ApiOperation({
    summary: 'Retry failed webhook deliveries',
    description: 'Retry processing of failed webhook deliveries'
  })
  @ApiQuery({ name: 'webhookId', description: 'Specific webhook ID to retry (optional)', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retry operation completed' })
  async retryFailedDeliveries(@Query('webhookId') webhookId?: string) {
    const retryCount = await this.webhookService.retryFailedDeliveries(webhookId);
    return {
      message: `Retried ${retryCount} failed deliveries`,
      retryCount,
      webhookId: webhookId || 'all'
    };
  }

  @Post('test/:webhookId')
  @ApiOperation({
    summary: 'Send test webhook',
    description: 'Send a test webhook to verify configuration'
  })
  @ApiParam({ name: 'webhookId', description: 'Webhook ID to test', example: 'wh_test123' })
  @ApiBody({
    description: 'Test payload (optional)',
    required: false,
    schema: {
      type: 'object',
      properties: {
        customData: { type: 'object', additionalProperties: true }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Test webhook sent' })
  async sendTestWebhook(
    @Param('webhookId') webhookId: string,
    @Body() customData?: any,
  ) {
    const testPayload: WebhookPayload = {
      event: 'test.webhook',
      data: {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString(),
        customData: customData || {},
      },
      timestamp: Date.now(),
      webhookId,
    };

    // Generate signature for test
    const secret = process.env.WEBHOOK_SECRET || 'default-webhook-secret-change-in-production';
    const signature = this.webhookService.generateSignature(testPayload, secret);

    return this.webhookService.verifyAndProcessWebhook(
      testPayload,
      signature.signature,
      secret,
      webhookId
    );
  }
}
