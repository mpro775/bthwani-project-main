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
import { MaaroufChatService } from './maarouf-chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/maarouf-chat',
})
export class MaaroufChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MaaroufChatGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set of socketIds
  private typingUsers = new Map<string, NodeJS.Timeout>(); // conversationId -> timeout

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private maaroufChatService: MaaroufChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        this.logger.warn(
          `MaaroufChat connection rejected: No token - ${client.id}`,
        );
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

      this.logger.log(
        `User connected to MaaroufChat: ${payload.sub} - Socket: ${client.id}`,
      );

      client.join(`user_${payload.sub}`);
      this.connectedUsers.set(payload.sub, client.id);

      client.emit('connected', {
        success: true,
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error(
        `MaaroufChat authentication failed for socket ${client.id}:`,
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

    this.logger.log(`Client disconnected from MaaroufChat: ${client.id} (${userId})`);

    if (userId) {
      this.connectedUsers.delete(userId);
    }

    // تنظيف rooms
    this.conversationRooms.forEach((sockets, conversationId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.conversationRooms.delete(conversationId);
      }
    });
  }

  @SubscribeMessage('maarouf-chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        client.emit('error', {
          code: 'UNAUTHORIZED',
          userMessage: 'يجب تسجيل الدخول أولاً',
        });
        return;
      }

      // التحقق من الصلاحيات
      await this.maaroufChatService.getConversationById(data.conversationId, userId);

      const room = `conversation_${data.conversationId}`;
      client.join(room);

      if (!this.conversationRooms.has(data.conversationId)) {
        this.conversationRooms.set(data.conversationId, new Set());
      }
      this.conversationRooms.get(data.conversationId)?.add(client.id);

      this.logger.log(
        `User ${userId} joined conversation ${data.conversationId}`,
      );

      client.emit('maarouf-chat:joined', {
        conversationId: data.conversationId,
        success: true,
      });
    } catch (error) {
      this.logger.error('Error joining conversation:', error);
      client.emit('error', {
        code: 'JOIN_FAILED',
        userMessage: 'فشل في الانضمام للمحادثة',
      });
    }
  }

  @SubscribeMessage('maarouf-chat:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const room = `conversation_${data.conversationId}`;
    client.leave(room);

    const sockets = this.conversationRooms.get(data.conversationId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.conversationRooms.delete(data.conversationId);
      }
    }

    this.logger.log(
      `User ${client.data.userId} left conversation ${data.conversationId}`,
    );
  }

  @SubscribeMessage('maarouf-chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; text: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        client.emit('error', {
          code: 'UNAUTHORIZED',
          userMessage: 'يجب تسجيل الدخول أولاً',
        });
        return;
      }

      const dto: SendMessageDto = { text: data.text };
      const message = await this.maaroufChatService.sendMessage(
        data.conversationId,
        userId,
        dto,
      );

      // إرسال الرسالة للطرف الآخر
      const conversation = await this.maaroufChatService.getConversationById(
        data.conversationId,
        userId,
      );

      const otherUserId =
        conversation.ownerId.toString() === userId
          ? conversation.interestedUserId.toString()
          : conversation.ownerId.toString();

      const room = `conversation_${data.conversationId}`;
      this.server.to(room).emit('maarouf-chat:message:new', {
        ...message.toObject(),
        conversationId: data.conversationId,
      });

      // إرسال إشعار للمستخدم الآخر إذا لم يكن متصل
      if (!this.connectedUsers.has(otherUserId)) {
        this.server.to(`user_${otherUserId}`).emit('maarouf-chat:notification', {
          conversationId: data.conversationId,
          message: message.toObject(),
        });
      }

      this.logger.log(
        `Message sent in conversation ${data.conversationId} by user ${userId}`,
      );
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', {
        code: 'SEND_FAILED',
        userMessage: 'فشل في إرسال الرسالة',
      });
    }
  }

  @SubscribeMessage('maarouf-chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const room = `conversation_${data.conversationId}`;
    
    // إلغاء timeout السابق
    const timeoutKey = `${data.conversationId}_${userId}`;
    if (this.typingUsers.has(timeoutKey)) {
      clearTimeout(this.typingUsers.get(timeoutKey)!);
      this.typingUsers.delete(timeoutKey);
    }

    if (data.isTyping) {
      // إرسال مؤشر الكتابة
      client.to(room).emit('maarouf-chat:typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: true,
      });

      // إلغاء مؤشر الكتابة بعد 3 ثوان
      const timeout = setTimeout(() => {
        client.to(room).emit('maarouf-chat:typing', {
          conversationId: data.conversationId,
          userId,
          isTyping: false,
        });
        this.typingUsers.delete(timeoutKey);
      }, 3000);

      this.typingUsers.set(timeoutKey, timeout);
    } else {
      client.to(room).emit('maarouf-chat:typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: false,
      });
    }
  }

  @SubscribeMessage('maarouf-chat:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) return;

      await this.maaroufChatService.markAsRead(data.conversationId, userId);

      const room = `conversation_${data.conversationId}`;
      this.server.to(room).emit('maarouf-chat:read', {
        conversationId: data.conversationId,
        userId,
      });

      this.logger.log(
        `User ${userId} marked conversation ${data.conversationId} as read`,
      );
    } catch (error) {
      this.logger.error('Error marking as read:', error);
    }
  }
}
