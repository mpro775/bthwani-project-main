import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CancelOrderCommand } from '../impl/cancel-order.command';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentMethod } from '../../enums/order-status.enum';
import { OrderCancelledEvent } from '../../events/impl/order-cancelled.event';
import { WalletService } from '../../../wallet/wallet.service';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventBus: EventBus,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService, // ✅ إضافة WalletService
  ) {}

  async execute(command: CancelOrderCommand): Promise<Order> {
    const order = await this.orderModel.findById(command.orderId);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // التحقق من الصلاحية
    if (command.userId && order.user.toString() !== command.userId) {
      throw new BadRequestException({
        code: 'NOT_YOUR_ORDER',
        message: 'This is not your order',
        userMessage: 'هذا ليس طلبك',
      });
    }

    // التحقق من إمكانية الإلغاء
    if (
      ![
        OrderStatus.CREATED,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
      ].includes(order.status as OrderStatus)
    ) {
      throw new BadRequestException({
        code: 'CANNOT_CANCEL',
        message: 'Order cannot be cancelled at this stage',
        userMessage: 'لا يمكن إلغاء الطلب في هذه المرحلة',
      });
    }

    // إلغاء الطلب
    order.status = OrderStatus.CANCELLED;
    order.cancelReason = command.reason;
    order.canceledBy = command.canceledBy;
    order.canceledAt = new Date();

    order.statusHistory.push({
      status: OrderStatus.CANCELLED as string,
      changedAt: new Date(),
      changedBy: command.canceledBy,
    });

    await order.save();

    // ✅ إرجاع المبلغ المحجوز من المحفظة
    if (
      (order.paymentMethod === PaymentMethod.WALLET ||
        order.paymentMethod === PaymentMethod.MIXED) &&
      order.walletUsed > 0
    ) {
      try {
        await this.walletService.refundHeldFunds(
          order.user.toString(),
          order.walletUsed,
          command.orderId,
        );
      } catch (error) {
        // تسجيل الخطأ ولكن لا نمنع الإلغاء
        console.error('Error refunding wallet funds:', error);
      }
    }

    // مسح cache
    await this.cacheManager.del(`order:${command.orderId}`);
    await this.cacheManager.del(`orders:user:${order.user.toString()}`);

    // إصدار Event
    this.eventBus.publish(
      new OrderCancelledEvent(
        String(order._id),
        order.user.toString(),
        command.reason,
        command.canceledBy,
      ),
    );

    return order;
  }
}
