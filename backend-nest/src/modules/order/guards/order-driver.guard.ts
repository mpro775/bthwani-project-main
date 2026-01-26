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
 * Guard للتحقق من أن السائق هو المكلف بالطلب
 * يستخدم في endpoints التي تحتاج التحقق من أن السائق مكلف بالطلب
 */
@Injectable()
export class OrderDriverGuard implements CanActivate {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orderId = request.params.id || request.params.orderId;
    const driverId = request.user?.id || request.user?.sub;

    if (!orderId) {
      throw new NotFoundException({
        code: 'ORDER_ID_REQUIRED',
        message: 'Order ID is required',
        userMessage: 'معرّف الطلب مطلوب',
      });
    }

    if (!driverId) {
      throw new ForbiddenException({
        code: 'DRIVER_NOT_AUTHENTICATED',
        message: 'Driver not authenticated',
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

    // التحقق من أن الطلب له سائق
    if (!order.driver) {
      throw new ForbiddenException({
        code: 'ORDER_NOT_ASSIGNED',
        message: 'Order is not assigned to any driver',
        userMessage: 'الطلب غير مكلف لأي سائق',
      });
    }

    // التحقق من أن السائق هو المكلف بالطلب
    if (order.driver.toString() !== driverId) {
      throw new ForbiddenException({
        code: 'NOT_ASSIGNED_DRIVER',
        message: 'You are not assigned to this order',
        userMessage: 'أنت لست مكلفاً بهذا الطلب',
      });
    }

    // إضافة الطلب إلى request للاستخدام في الـ controller
    request.order = order;

    return true;
  }
}
