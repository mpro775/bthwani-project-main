import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderStatusChangedEvent } from '../impl/order-status-changed.event';
import { OrderGateway } from '../../../../gateways/order.gateway';

@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedHandler
  implements IEventHandler<OrderStatusChangedEvent>
{
  private readonly logger = new Logger(OrderStatusChangedHandler.name);

  constructor(private orderGateway: OrderGateway) {}

  handle(event: OrderStatusChangedEvent) {
    this.logger.log(
      `Order ${event.orderId} status changed: ${event.oldStatus} → ${event.newStatus}`,
    );

    // إرسال تحديث عبر WebSocket
    this.orderGateway.broadcastOrderStatusChange(
      event.orderId,
      event.newStatus,
      {
        _id: event.orderId,
        status: event.newStatus,
      },
    );

    // هنا يمكن إضافة:
    // - إرسال إشعار للمستخدم
    // - إرسال إشعار للسائق
    // - تحديث إحصائيات
    // - تسجيل في analytics
  }
}
