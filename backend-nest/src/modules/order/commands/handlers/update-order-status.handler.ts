import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UpdateOrderStatusCommand } from '../impl/update-order-status.command';
import { Order } from '../../entities/order.entity';
import { OrderStatusChangedEvent } from '../../events/impl/order-status-changed.event';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<Order> {
    const order = await this.orderModel.findById(command.orderId);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    const oldStatus = order.status;

    // تحديث الحالة
    order.status = command.status;
    order.statusHistory.push({
      status: command.status,
      changedAt: new Date(),
      changedBy: command.changedBy,
    });

    await order.save();

    // مسح cache
    await this.cacheManager.del(`order:${command.orderId}`);
    await this.cacheManager.del(`orders:user:${order.user.toString()}`);

    // إصدار Event
    this.eventBus.publish(
      new OrderStatusChangedEvent(
        String(order._id),
        oldStatus,
        command.status,
        command.changedBy,
      ),
    );

    return order;
  }
}
