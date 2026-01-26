import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';
import { WebhookController } from './webhook.controller';
import { DLQController } from './dlq.controller';
import { PreferenceController } from './preference.controller';
import { NotificationService } from './notification.service';
import { WebhookService } from './services/webhook.service';
import { DLQService } from './services/dlq.service';
import { SuppressionService } from './services/suppression.service';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
import {
  NotificationSuppression,
  NotificationSuppressionSchema,
} from './entities/suppression.entity';
import {
  WebhookDelivery,
  WebhookDeliverySchema,
} from './entities/webhook-delivery.entity';
import {
  WebhookEvent,
  WebhookEventSchema,
} from './entities/webhook-event.entity';
import {
  DLQJob,
  DLQJobSchema,
} from './entities/dlq-job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationSuppression.name, schema: NotificationSuppressionSchema },
      { name: WebhookDelivery.name, schema: WebhookDeliverySchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: DLQJob.name, schema: DLQJobSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [NotificationController, WebhookController, DLQController, PreferenceController],
  providers: [NotificationService, WebhookService, DLQService, SuppressionService],
  exports: [NotificationService, WebhookService, SuppressionService],
})
export class NotificationModule {}
