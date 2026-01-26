import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AssignDriverCommand } from '../impl/assign-driver.command';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { DriverAssignedEvent } from '../../events/impl/driver-assigned.event';

@CommandHandler(AssignDriverCommand)
export class AssignDriverHandler
  implements ICommandHandler<AssignDriverCommand>
{
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventBus: EventBus,
  ) {}

  async execute(command: AssignDriverCommand): Promise<Order> {
    const order = await this.orderModel.findById(command.orderId);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    if (order.status !== (OrderStatus.READY as string)) {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Order must be ready to assign driver',
        userMessage: 'يجب أن يكون الطلب جاهزاً لتعيين السائق',
      });
    }

    // تعيين السائق
    order.driver = new Types.ObjectId(command.driverId);
    order.status = OrderStatus.PICKED_UP;
    order.assignedAt = new Date();

    order.statusHistory.push({
      status: OrderStatus.PICKED_UP as string,
      changedAt: new Date(),
      changedBy: command.assignedBy,
    });

    await order.save();

    // مسح cache
    await this.cacheManager.del(`order:${command.orderId}`);
    await this.cacheManager.del(`orders:user:${order.user.toString()}`);
    await this.cacheManager.del(`orders:driver:${command.driverId}`);

    // إصدار Event
    this.eventBus.publish(
      new DriverAssignedEvent(
        String(order._id),
        command.driverId,
        order.user.toString(),
      ),
    );

    return order;
  }
}
