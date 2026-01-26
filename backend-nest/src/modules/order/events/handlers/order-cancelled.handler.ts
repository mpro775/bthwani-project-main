import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderCancelledEvent } from '../impl/order-cancelled.event';
import { OrderGateway } from '../../../../gateways/order.gateway';

@EventsHandler(OrderCancelledEvent)
export class OrderCancelledHandler
  implements IEventHandler<OrderCancelledEvent>
{
  private readonly logger = new Logger(OrderCancelledHandler.name);

  constructor(private orderGateway: OrderGateway) {}

  handle(event: OrderCancelledEvent) {
    this.logger.log(
      `Order ${event.orderId} cancelled by ${event.canceledBy}: ${event.reason}`,
    );

    // إرسال إشعار عبر WebSocket
    this.orderGateway.broadcastOrderCancelled(
      event.orderId,
      event.reason,
      event.canceledBy,
      {
        _id: event.orderId,
        user: event.userId,
      },
    );

    // هنا يمكن إضافة:
    // - إطلاق الأموال المحجوزة
    // - إرجاع المخزون
    // - إرسال إشعارات
    // - تحديث إحصائيات الإلغاء
  }
}
