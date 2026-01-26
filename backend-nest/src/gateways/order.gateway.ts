import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../modules/order/entities/order.entity';
import { JoinOrderDto, JoinDriverRoomDto } from './dto/join-room.dto';

// Rate Limiter - حماية من الـ Spam والـ DDoS
interface RateLimiterStore {
  points: number;
  resetTime: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/orders',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('OrderGateway');
  
  // Rate Limiter Configuration
  private rateLimitStore = new Map<string, RateLimiterStore>();
  private readonly MAX_POINTS = 20; // عدد الرسائل المسموح بها
  private readonly DURATION = 10; // في 10 ثوان
  private readonly LOCATION_MAX_POINTS = 60; // للمواقع: رسالة واحدة كل ثانية
  private readonly LOCATION_DURATION = 60; // في دقيقة

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {
    // تنظيف الـ rate limiter كل دقيقة
    setInterval(() => this.cleanupRateLimiter(), 60000);
  }

  /**
   * التحقق من Rate Limit
   */
  private async checkRateLimit(
    clientId: string,
    maxPoints: number = this.MAX_POINTS,
    duration: number = this.DURATION,
  ): Promise<boolean> {
    const now = Date.now();
    const key = `${clientId}_${duration}`;
    let limiter = this.rateLimitStore.get(key);

    if (!limiter || now > limiter.resetTime) {
      // إنشاء limiter جديد
      limiter = {
        points: maxPoints - 1,
        resetTime: now + duration * 1000,
      };
      this.rateLimitStore.set(key, limiter);
      return true;
    }

    if (limiter.points > 0) {
      limiter.points--;
      return true;
    }

    // تجاوز الحد المسموح
    return false;
  }

  /**
   * تنظيف الـ rate limiters المنتهية
   */
  private cleanupRateLimiter() {
    const now = Date.now();
    for (const [key, limiter] of this.rateLimitStore.entries()) {
      if (now > limiter.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  // ==================== Connection Management ====================

  async handleConnection(client: Socket) {
    try {
      // استخراج JWT Token من الاتصال
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided - ${client.id}`);
        client.emit('error', {
          code: 'NO_TOKEN',
          message: 'Authentication token is required',
          userMessage: 'يجب تسجيل الدخول أولاً',
        });
        client.disconnect();
        return;
      }

      // التحقق من صحة التوكن
      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // حفظ بيانات المستخدم المصادق عليها
      client.data.user = payload;
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.logger.log(
        `Authenticated user connected: ${payload.sub} (${payload.role}) - Socket: ${client.id}`,
      );

      // الانضمام للغرف بناءً على المستخدم المصادق
      client.join(`user_${payload.sub}`);

      // إذا كان admin، الانضمام لغرفة الإدارة
      if (payload.role === 'admin' || payload.role === 'superadmin') {
        client.join('admin_orders');
        this.logger.log(`Admin ${payload.sub} joined admin_orders room`);
      }

      // إرسال تأكيد الاتصال
      client.emit('connected', {
        success: true,
        userId: payload.sub,
        role: payload.role,
      });
    } catch (error) {
      this.logger.error(
        `Authentication failed for socket ${client.id}:`,
        error instanceof Error ? error.message : error,
      );
      client.emit('error', {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        userMessage: 'رمز الدخول غير صالح أو منتهي الصلاحية',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ==================== Room Subscriptions ====================

  @SubscribeMessage('join:order')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinOrderDto,
  ) {
    try {
      // Rate Limiting
      const canProceed = await this.checkRateLimit(client.id);
      if (!canProceed) {
        this.logger.warn(`Rate limit exceeded for client ${client.id}`);
        return {
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          userMessage: 'عدد كبير جداً من الطلبات، يرجى المحاولة لاحقاً',
        };
      }

      const userId = client.data.userId;
      const role = client.data.role;

      if (!userId) {
        return { success: false, error: 'Not authenticated' };
      }

      // التحقق من وجود الطلب
      const order = await this.orderModel.findById(data.orderId);

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // التحقق من صلاحية الوصول للطلب
      const isOwner = order.user.toString() === userId;
      const isDriver = order.driver?.toString() === userId;
      const isAdmin = role === 'admin' || role === 'superadmin';

      if (!isOwner && !isDriver && !isAdmin) {
        this.logger.warn(
          `Unauthorized access attempt: User ${userId} tried to join order ${data.orderId}`,
        );
        return {
          success: false,
          error: 'Not authorized to view this order',
          code: 'UNAUTHORIZED',
        };
      }

      client.join(`order_${data.orderId}`);
      this.logger.log(
        `User ${userId} (${role}) joined order room: ${data.orderId}`,
      );
      return { success: true, room: `order_${data.orderId}` };
    } catch (error) {
      this.logger.error('Error joining order room:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  @SubscribeMessage('leave:order')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleLeaveOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinOrderDto,
  ) {
    // Rate Limiting
    const canProceed = await this.checkRateLimit(client.id);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    client.leave(`order_${data.orderId}`);
    this.logger.log(`Client ${client.id} left order room: ${data.orderId}`);
    return { success: true };
  }

  @SubscribeMessage('join:driver')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleJoinDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinDriverRoomDto,
  ) {
    // Rate Limiting
    const canProceed = await this.checkRateLimit(client.id);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    const userId = client.data.userId;
    const role = client.data.role;

    // التحقق من أن المستخدم هو السائق نفسه أو admin
    if (userId !== data.driverId && role !== 'admin' && role !== 'superadmin') {
      this.logger.warn(
        `Unauthorized: User ${userId} tried to join driver room ${data.driverId}`,
      );
      return { success: false, error: 'Not authorized' };
    }

    client.join(`driver_${data.driverId}`);
    this.logger.log(`User ${userId} joined driver room: ${data.driverId}`);
    return { success: true, room: `driver_${data.driverId}` };
  }

  @SubscribeMessage('admin:subscribe')
  async handleAdminSubscribe(@ConnectedSocket() client: Socket) {
    // Rate Limiting
    const canProceed = await this.checkRateLimit(client.id);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    const role = client.data.role;
    
    if (role === 'admin' || role === 'superadmin') {
      client.join('admin_orders');
      this.logger.log(`Admin ${client.data.userId} subscribed to admin_orders`);
      return { success: true };
    }
    
    this.logger.warn(
      `Unauthorized admin subscribe attempt by user ${client.data.userId}`,
    );
    return { success: false, error: 'Not authorized' };
  }

  // ==================== Order Events Broadcast ====================

  /**
   * بث تحديث طلب لجميع المهتمين
   */
  broadcastOrderUpdate(orderId: string, order: any) {
    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('order:updated', order);
    }

    // إرسال للسائق
    if (order.driver) {
      this.server.to(`driver_${order.driver}`).emit('order:updated', order);
    }

    // إرسال لغرفة الطلب
    this.server.to(`order_${orderId}`).emit('order:updated', order);

    // إرسال للإدارة
    this.server.to('admin_orders').emit('order:updated', order);

    this.logger.log(`Order updated broadcast: ${orderId}`);
  }

  /**
   * طلب جديد تم إنشاؤه
   */
  broadcastNewOrder(order: any) {
    // إرسال للإدارة
    this.server.to('admin_orders').emit('order:created', order);

    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('order:created', order);
    }

    this.logger.log(`New order broadcast: ${order._id}`);
  }

  /**
   * تغيير حالة الطلب
   */
  broadcastOrderStatusChange(orderId: string, status: string, order: any) {
    const event = {
      orderId,
      status,
      timestamp: new Date(),
      order,
    };

    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('order:status_changed', event);
    }

    // إرسال للسائق
    if (order.driver) {
      this.server.to(`driver_${order.driver}`).emit('order:status_changed', event);
    }

    // إرسال للإدارة
    this.server.to('admin_orders').emit('order:status_changed', event);

    this.logger.log(`Order status changed: ${orderId} → ${status}`);
  }

  /**
   * تعيين سائق للطلب
   */
  broadcastDriverAssigned(orderId: string, driverId: string, order: any) {
    const event = {
      orderId,
      driverId,
      timestamp: new Date(),
      order,
    };

    // إرسال للسائق
    this.server.to(`driver_${driverId}`).emit('order:assigned', event);

    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('driver:assigned', event);
    }

    // إرسال للإدارة
    this.server.to('admin_orders').emit('driver:assigned', event);

    this.logger.log(`Driver assigned: ${driverId} to order ${orderId}`);
  }

  /**
   * السائق وصل
   */
  broadcastDriverArrived(orderId: string, driverId: string) {
    const event = {
      orderId,
      driverId,
      timestamp: new Date(),
    };

    // إرسال للعميل
    this.server.to(`order_${orderId}`).emit('driver:arrived', event);

    this.logger.log(`Driver arrived: ${driverId} for order ${orderId}`);
  }

  /**
   * الطلب تم توصيله
   */
  broadcastOrderDelivered(orderId: string, order: any) {
    const event = {
      orderId,
      timestamp: new Date(),
      order,
    };

    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('order:delivered', event);
    }

    // إرسال للسائق
    if (order.driver) {
      this.server.to(`driver_${order.driver}`).emit('order:delivered', event);
    }

    // إرسال للإدارة
    this.server.to('admin_orders').emit('order:delivered', event);

    this.logger.log(`Order delivered: ${orderId}`);
  }

  /**
   * الطلب تم إلغاؤه
   */
  broadcastOrderCancelled(orderId: string, reason: string, cancelledBy: string, order: any) {
    const event = {
      orderId,
      reason,
      cancelledBy,
      timestamp: new Date(),
      order,
    };

    // إرسال للعميل
    if (order.user) {
      this.server.to(`user_${order.user}`).emit('order:cancelled', event);
    }

    // إرسال للسائق
    if (order.driver) {
      this.server.to(`driver_${order.driver}`).emit('order:cancelled', event);
    }

    // إرسال للإدارة
    this.server.to('admin_orders').emit('order:cancelled', event);

    this.logger.log(`Order cancelled: ${orderId} by ${cancelledBy}`);
  }
}

