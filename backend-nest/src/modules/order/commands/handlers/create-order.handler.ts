import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateOrderCommand } from '../impl/create-order.command';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentMethod } from '../../enums/order-status.enum';
import { OrderCreatedEvent } from '../../events/impl/order-created.event';
import { WalletService } from '../../../wallet/wallet.service';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventBus: EventBus,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService, // ✅ إضافة WalletService
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    // 1. التحقق من صحة البيانات
    if (!command.items || command.items.length === 0) {
      throw new BadRequestException({
        code: 'NO_ITEMS',
        message: 'Order must have at least one item',
        userMessage: 'يجب أن يحتوي الطلب على منتج واحد على الأقل',
      });
    }

    // 2. حساب المبلغ الإجمالي والمبلغ المستخدم من المحفظة
    const totalAmount = command.price + command.deliveryFee;
    const walletUsed = command.walletUsed || 0;

    // 3. ✅ التحقق من الرصيد قبل إنشاء الطلب
    if (
      command.paymentMethod === PaymentMethod.WALLET ||
      command.paymentMethod === PaymentMethod.MIXED
    ) {
      if (walletUsed > 0) {
        const walletBalance = await this.walletService.getWalletBalance(
          command.userId,
        );
        if (walletBalance.availableBalance < walletUsed) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient wallet balance',
            userMessage: 'رصيد المحفظة غير كاف لإتمام الطلب',
            suggestedAction: 'يرجى إضافة رصيد إلى المحفظة أو اختيار طريقة دفع أخرى',
          });
        }
      }
    }

    // 4. إنشاء الطلب أولاً
    const order = await this.orderModel.create({
      user: new Types.ObjectId(command.userId),
      items: command.items.map((item) => ({
        ...item,
        productId: new Types.ObjectId(item.productId),
        store: new Types.ObjectId(item.store),
      })),
      address: command.address,
      paymentMethod: command.paymentMethod,
      price: command.price,
      deliveryFee: command.deliveryFee,
      companyShare: command.companyShare,
      platformShare: command.platformShare,
      walletUsed: walletUsed,
      cashDue: totalAmount - walletUsed,
      status: OrderStatus.CREATED,
      statusHistory: [
        {
          status: OrderStatus.CREATED,
          changedAt: new Date(),
          changedBy: 'customer',
        },
      ],
    });

    // 5. ✅ حجز المبلغ من المحفظة بعد إنشاء الطلب (مع orderId الصحيح)
    if (
      (command.paymentMethod === PaymentMethod.WALLET ||
        command.paymentMethod === PaymentMethod.MIXED) &&
      walletUsed > 0
    ) {
      try {
        await this.walletService.holdFunds(
          command.userId,
          walletUsed,
          String(order._id), // ✅ استخدام orderId الصحيح
        );
      } catch (error) {
        // إذا فشل الحجز، نحذف الطلب
        await this.orderModel.findByIdAndDelete(order._id);
        throw error;
      }
    }

    // 6. مسح cache
    await this.cacheManager.del(`orders:user:${command.userId}`);

    // 7. إصدار Event
    this.eventBus.publish(
      new OrderCreatedEvent(
        String(order._id),
        command.userId,
        order.items,
        order.price,
      ),
    );

    return order;
  }
}
