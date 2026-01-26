import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GetOrderQuery } from '../impl/get-order.query';
import { Order } from '../../entities/order.entity';

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  private readonly ORDER_CACHE_TTL = 300; // 5 دقائق

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(query: GetOrderQuery): Promise<Order> {
    const cacheKey = `order:${query.orderId}`;

    // 1. محاولة الحصول من الـ cache
    const cached = await this.cacheManager.get<Order>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. جلب من DB
    const order = (await this.orderModel
      .findById(query.orderId)
      .populate('user', 'fullName phone email profileImage')
      .populate('driver', 'fullName phone profileImage')
      .lean()) as unknown as Order;

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // 3. حفظ في الـ cache
    await this.cacheManager.set(cacheKey, order, this.ORDER_CACHE_TTL * 1000);

    return order;
  }
}
