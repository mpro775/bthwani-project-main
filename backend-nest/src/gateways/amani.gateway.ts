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
import { Amani } from '../modules/amani/entities/amani.entity';
import { AmaniService } from '../modules/amani/amani.service';

// Rate Limiter
interface RateLimiterStore {
  points: number;
  resetTime: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/amani',
})
export class AmaniGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('AmaniGateway');
  
  // Rate Limiter Configuration
  private rateLimitStore = new Map<string, RateLimiterStore>();
  private readonly MAX_POINTS = 20;
  private readonly DURATION = 10;
  private readonly LOCATION_MAX_POINTS = 60;
  private readonly LOCATION_DURATION = 60;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Amani.name) private amaniModel: Model<Amani>,
    private amaniService: AmaniService,
  ) {
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

      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      client.data.user = payload;
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.data.driverId = payload.driverId;

      this.logger.log(
        `Authenticated user connected: ${payload.sub} (${payload.role}) - Socket: ${client.id}`,
      );

      // الانضمام للغرف
      client.join(`user_${payload.sub}`);
      
      if (payload.role === 'driver' || payload.driverId) {
        client.join(`driver_${payload.driverId || payload.sub}`);
      }

      if (payload.role === 'admin' || payload.role === 'superadmin') {
        client.join('admin_amani');
      }

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
        code: 'AUTH_FAILED',
        message: 'Authentication failed',
        userMessage: 'فشل التحقق من الهوية',
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ==================== Room Management ====================

  @SubscribeMessage('amani:join')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleJoinAmaniRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { amaniId: string },
  ) {
    const canProceed = await this.checkRateLimit(client.id);
    if (!canProceed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    const amani = await this.amaniModel.findById(data.amaniId);
    if (!amani) {
      return {
        success: false,
        error: 'Amani order not found',
        code: 'NOT_FOUND',
      };
    }

    // التحقق من الصلاحيات
    const userId = client.data.userId;
    const isOwner = amani.ownerId.toString() === userId;
    const isDriver = amani.driver?.toString() === client.data.driverId;
    const isAdmin = client.data.role === 'admin' || client.data.role === 'superadmin';

    if (!isOwner && !isDriver && !isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    // الانضمام لغرفة الطلب
    client.join(`amani_${data.amaniId}`);
    
    return {
      success: true,
      amaniId: data.amaniId,
    };
  }

  // ==================== Status Updates ====================

  /**
   * بث تحديث الحالة لجميع المشتركين في غرفة الطلب
   */
  broadcastStatusUpdate(amaniId: string, status: string, data?: any) {
    this.server.to(`amani_${amaniId}`).emit('amani:status_updated', {
      amaniId,
      status,
      timestamp: new Date(),
      ...data,
    });
  }

  /**
   * بث تعيين السائق
   */
  broadcastDriverAssigned(amaniId: string, driverId: string, driverData?: any) {
    this.server.to(`amani_${amaniId}`).emit('amani:driver_assigned', {
      amaniId,
      driverId,
      driver: driverData,
      timestamp: new Date(),
    });

    // إرسال إشعار للسائق
    this.server.to(`driver_${driverId}`).emit('amani:new_assignment', {
      amaniId,
      timestamp: new Date(),
    });
  }

  /**
   * بث تحديث موقع السائق
   */
  broadcastLocationUpdate(amaniId: string, location: { lat: number; lng: number }) {
    this.server.to(`amani_${amaniId}`).emit('amani:location_updated', {
      amaniId,
      location,
      timestamp: new Date(),
    });
  }

  // ==================== Driver Location Updates ====================

  @SubscribeMessage('driver:update_location')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleDriverLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { amaniId: string; lat: number; lng: number },
  ) {
    const canProceed = await this.checkRateLimit(
      client.id,
      this.LOCATION_MAX_POINTS,
      this.LOCATION_DURATION,
    );

    if (!canProceed) {
      return {
        success: false,
        error: 'Too many location updates',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }

    const driverId = client.data.driverId || client.data.userId;
    if (!driverId) {
      return { success: false, error: 'Not authenticated as driver' };
    }

    // التحقق من أن السائق معين لهذا الطلب
    const amani = await this.amaniModel.findById(data.amaniId);
    if (!amani || amani.driver?.toString() !== driverId) {
      return {
        success: false,
        error: 'Unauthorized or order not found',
        code: 'UNAUTHORIZED',
      };
    }

    // تحديث الموقع في قاعدة البيانات
    try {
      await this.amaniService.updateDriverLocation(data.amaniId, {
        lat: data.lat,
        lng: data.lng,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update location for amani ${data.amaniId}:`,
        error instanceof Error ? error.message : String(error),
      );
    }

    // بث التحديث
    this.broadcastLocationUpdate(data.amaniId, {
      lat: data.lat,
      lng: data.lng,
    });

    return { success: true };
  }
}
