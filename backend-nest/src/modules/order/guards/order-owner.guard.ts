import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../entities/order.entity';

/**
 * Guard للتحقق من أن المستخدم هو صاحب الطلب
 * يستخدم في endpoints التي تحتاج التحقق من ملكية الطلب
 */
@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orderId = request.params.id || request.params.orderId;
    const userId = request.user?.id || request.user?.sub;

    if (!orderId) {
      throw new NotFoundException({
        code: 'ORDER_ID_REQUIRED',
        message: 'Order ID is required',
        userMessage: 'معرّف الطلب مطلوب',
      });
    }

    if (!userId) {
      throw new ForbiddenException({
        code: 'USER_NOT_AUTHENTICATED',
        message: 'User not authenticated',
        userMessage: 'يجب تسجيل الدخول أولاً',
      });
    }

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // التحقق من أن المستخدم هو صاحب الطلب
    if (order.user.toString() !== userId) {
      throw new ForbiddenException({
        code: 'NOT_ORDER_OWNER',
        message: 'You are not the owner of this order',
        userMessage: 'أنت لست صاحب هذا الطلب',
      });
    }

    // إضافة الطلب إلى request للاستخدام في الـ controller
    request.order = order;

    return true;
  }
}
