import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { OrderGateway } from '../../../../gateways/order.gateway';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(private orderGateway: OrderGateway) {}

  handle(event: OrderCreatedEvent) {
    this.logger.log(`Order created: ${event.orderId} by user ${event.userId}`);

    // إرسال إشعار عبر WebSocket
    this.orderGateway.broadcastNewOrder({
      _id: event.orderId,
      user: event.userId,
      items: event.items,
      totalAmount: event.totalAmount,
    });

    // هنا يمكن إضافة:
    // - إرسال إشعار push للمستخدم
    // - إرسال email تأكيد
    // - تسجيل في analytics
    // - إضافة إلى queue للمعالجة
  }
}
