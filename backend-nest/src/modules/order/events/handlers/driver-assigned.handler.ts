import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DriverAssignedEvent } from '../impl/driver-assigned.event';
import { OrderGateway } from '../../../../gateways/order.gateway';
import { DriverGateway } from '../../../../gateways/driver.gateway';

@EventsHandler(DriverAssignedEvent)
export class DriverAssignedHandler
  implements IEventHandler<DriverAssignedEvent>
{
  private readonly logger = new Logger(DriverAssignedHandler.name);

  constructor(
    private orderGateway: OrderGateway,
    private driverGateway: DriverGateway,
  ) {}

  handle(event: DriverAssignedEvent) {
    this.logger.log(
      `Driver ${event.driverId} assigned to order ${event.orderId}`,
    );

    // إرسال للسائق عبر WebSocket
    this.driverGateway.sendNewOrderToDriver(event.driverId, {
      _id: event.orderId,
      user: event.userId,
    });

    // إرسال للمستخدم
    this.orderGateway.broadcastDriverAssigned(event.orderId, event.driverId, {
      _id: event.orderId,
      driver: event.driverId,
      user: event.userId,
    });

    // هنا يمكن إضافة:
    // - إرسال إشعار push للسائق
    // - إرسال SMS للعميل
    // - تحديث driver availability
  }
}
