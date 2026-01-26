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
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ==================== Connection Management ====================

  async handleConnection(client: Socket) {
    try {
      // استخراج JWT Token من الاتصال
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        this.logger.warn(
          `Notification connection rejected: No token - ${client.id}`,
        );
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
        `Authenticated user connected to notifications: ${payload.sub} (${payload.role}) - Socket: ${client.id}`,
      );

      // الانضمام لغرفة المستخدم
      client.join(`user_${payload.sub}`);
      this.connectedUsers.set(payload.sub, client.id);

      // الانضمام لغرفة الدور
      if (payload.role) {
        client.join(`role_${payload.role}`);
        this.logger.log(`User ${payload.sub} joined role room: ${payload.role}`);
      }

      // إرسال تأكيد الاتصال
      client.emit('connected', {
        success: true,
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error(
        `Notification authentication failed for socket ${client.id}:`,
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
    const userId = client.data.userId;

    this.logger.log(`Client disconnected from notifications: ${client.id} (${userId})`);

    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  // ==================== Send Notifications ====================

  /**
   * إرسال إشعار لمستخدم محدد
   */
  sendToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification sent to user ${userId}`);
  }

  /**
   * إرسال إشعار لعدة مستخدمين
   */
  sendToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, notification);
    });

    this.logger.log(`Notification sent to ${userIds.length} users`);
  }

  /**
   * إرسال إشعار لكل المستخدمين من نوع معين
   */
  broadcastToRole(role: string, notification: any) {
    this.server.to(`role_${role}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification broadcast to role: ${role}`);
  }

  /**
   * إرسال إشعار لكل المتصلين
   */
  broadcastToAll(notification: any) {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification broadcast to all users`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

