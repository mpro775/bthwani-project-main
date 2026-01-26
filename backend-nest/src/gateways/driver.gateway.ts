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
import { LocationUpdateDto } from './dto/location-update.dto';
import { DriverStatusDto } from './dto/driver-status.dto';
import { DriverService } from '../modules/driver/driver.service';

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
  namespace: '/drivers',
})
export class DriverGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('DriverGateway');
  private activeDrivers = new Map<string, string>(); // driverId -> socketId

  // Rate Limiter Configuration
  private rateLimitStore = new Map<string, RateLimiterStore>();
  private readonly MAX_POINTS = 20; // عدد الرسائل المسموح بها
  private readonly DURATION = 10; // في 10 ثوان
  private readonly LOCATION_MAX_POINTS = 120; // للمواقع: رسالتين في الثانية
  private readonly LOCATION_DURATION = 60; // في دقيقة

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private driverService: DriverService,
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
        this.logger.warn(`Driver connection rejected: No token - ${client.id}`);
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

      // التحقق من أن المستخدم سائق
      if (payload.role !== 'driver' && payload.role !== 'admin') {
        this.logger.warn(
          `Non-driver tried to connect to driver namespace: ${payload.sub}`,
        );
        client.emit('error', {
          code: 'INVALID_ROLE',
          message: 'Only drivers can connect to this namespace',
          userMessage: 'هذا الاتصال مخصص للسائقين فقط',
        });
        client.disconnect();
        return;
      }

      // حفظ بيانات السائق المصادق عليها
      client.data.user = payload;
      client.data.userId = payload.sub;
      client.data.driverId = payload.sub;
      client.data.role = payload.role;

      this.logger.log(
        `Authenticated driver connected: ${payload.sub} - Socket: ${client.id}`,
      );

      // الانضمام لغرفة السائق
      client.join(`driver_${payload.sub}`);
      this.activeDrivers.set(payload.sub, client.id);

      // بث حالة السائق (متصل)
      this.broadcastDriverStatus(payload.sub, 'online');

      // إرسال تأكيد الاتصال
      client.emit('connected', {
        success: true,
        driverId: payload.sub,
      });
    } catch (error) {
      this.logger.error(
        `Driver authentication failed for socket ${client.id}:`,
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
    const driverId = client.data.driverId;

    this.logger.log(`Driver disconnected: ${client.id} (${driverId})`);

    if (driverId) {
      this.activeDrivers.delete(driverId);
      this.broadcastDriverStatus(driverId, 'offline');
    }
  }

  // ==================== Location Tracking ====================

  @SubscribeMessage('driver:location')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LocationUpdateDto,
  ) {
    // Rate Limiting خاص للمواقع (أكثر تساهلاً لأن المواقع تُرسل بشكل متكرر)
    const canProceed = await this.checkRateLimit(
      client.id,
      this.LOCATION_MAX_POINTS,
      this.LOCATION_DURATION,
    );

    if (!canProceed) {
      this.logger.warn(
        `Location rate limit exceeded for driver ${client.data.driverId}`,
      );
      return {
        success: false,
        error: 'Too many location updates',
        code: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'عدد كبير جداً من تحديثات الموقع',
      };
    }

    const driverId = client.data.driverId;

    if (!driverId) {
      return { success: false, error: 'Not authenticated' };
    }

    // البيانات مضمونة صحتها من ValidationPipe
    // Broadcast location to admin
    this.server.to('admin_orders').emit('driver:location_updated', {
      driverId,
      location: { lat: data.lat, lng: data.lng, heading: data.heading },
      timestamp: new Date(),
    });

    // Update driver location in database
    try {
      await this.driverService.updateLocation(driverId, {
        lat: data.lat,
        lng: data.lng,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update driver ${driverId} location in database:`,
        error instanceof Error ? error.message : String(error),
      );
      // لا نوقف العملية، فقط نسجل الخطأ
    }

    this.logger.debug(
      `Driver ${driverId} location updated: ${data.lat}, ${data.lng}`,
    );
    return { success: true };
  }

  // ==================== Driver Status ====================

  @SubscribeMessage('driver:status')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: DriverStatusDto,
  ) {
    // Rate Limiting
    const canProceed = await this.checkRateLimit(client.id);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'عدد كبير جداً من الطلبات',
      };
    }

    const driverId = client.data.driverId;

    if (!driverId) {
      return { success: false, error: 'Not authenticated' };
    }

    // البيانات مضمونة صحتها من ValidationPipe
    // Broadcast status change
    this.server.to('admin_orders').emit('driver:status_changed', {
      driverId,
      isAvailable: data.isAvailable,
      timestamp: new Date(),
    });

    // Update driver status in database
    try {
      await this.driverService.updateAvailability(driverId, data.isAvailable);
    } catch (error) {
      this.logger.error(
        `Failed to update driver ${driverId} availability in database:`,
        error instanceof Error ? error.message : String(error),
      );
      // لا نوقف العملية، فقط نسجل الخطأ
    }

    this.logger.log(
      `Driver ${driverId} availability changed: ${data.isAvailable}`,
    );
    return { success: true };
  }

  // ==================== Broadcast Methods ====================

  /**
   * بث حالة السائق (online/offline)
   */
  broadcastDriverStatus(driverId: string, status: 'online' | 'offline') {
    this.server.to('admin_orders').emit('driver:status', {
      driverId,
      status,
      timestamp: new Date(),
    });

    this.logger.log(`Driver ${driverId} is now ${status}`);
  }

  /**
   * إرسال طلب جديد للسائق
   */
  sendNewOrderToDriver(driverId: string, order: any) {
    this.server.to(`driver_${driverId}`).emit('order:new', {
      order,
      timestamp: new Date(),
    });

    this.logger.log(`New order sent to driver ${driverId}: ${order._id}`);
  }

  /**
   * إرسال عرض طلب للسائقين المتاحين
   */
  broadcastOrderOffer(driverIds: string[], order: any) {
    driverIds.forEach((driverId) => {
      this.server.to(`driver_${driverId}`).emit('order:offer', {
        order,
        expiresAt: new Date(Date.now() + 60000), // expires in 1 minute
        timestamp: new Date(),
      });
    });

    this.logger.log(`Order offer broadcast to ${driverIds.length} drivers`);
  }

  /**
   * تحديث موقع السائق لحظياً
   */
  broadcastDriverLocation(
    driverId: string,
    location: { lat: number; lng: number },
  ) {
    // إرسال لغرفة السائق (للعملاء الذين يتتبعون)
    this.server.emit('driver:location', {
      driverId,
      location,
      timestamp: new Date(),
    });

    // إرسال للإدارة
    this.server.to('admin_orders').emit('driver:location_updated', {
      driverId,
      location,
      timestamp: new Date(),
    });
  }

  /**
   * إشعار السائق بإلغاء الطلب
   */
  notifyDriverOrderCancelled(
    driverId: string,
    orderId: string,
    reason: string,
  ) {
    this.server.to(`driver_${driverId}`).emit('order:cancelled', {
      orderId,
      reason,
      timestamp: new Date(),
    });

    this.logger.log(`Driver ${driverId} notified of order cancellation`);
  }

  /**
   * Get active drivers count
   */
  getActiveDriversCount(): number {
    return this.activeDrivers.size;
  }

  /**
   * Get active driver IDs
   */
  getActiveDriverIds(): string[] {
    return Array.from(this.activeDrivers.keys());
  }
}
