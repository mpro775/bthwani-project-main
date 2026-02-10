import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import {
  Es3afniConversation,
  Es3afniConversationStatus,
} from './entities/es3afni-conversation.entity';
import { Es3afniMessage } from './entities/es3afni-message.entity';
import { CreateEs3afniConversationDto } from './dto/create-conversation.dto';
import { SendEs3afniMessageDto } from './dto/send-message.dto';

const CONVERSATION_TTL_HOURS = 48;

@Injectable()
export class Es3afniChatService {
  constructor(
    @InjectModel(Es3afniConversation.name)
    private conversationModel: Model<Es3afniConversation>,
    @InjectModel(Es3afniMessage.name)
    private messageModel: Model<Es3afniMessage>,
    @InjectModel('Es3afni')
    private es3afniModel: Model<any>,
  ) {}

  async createConversation(
    dto: CreateEs3afniConversationDto,
    donorUserId: string,
  ) {
    const requestId = new Types.ObjectId(dto.requestId);
    const donorId = new Types.ObjectId(donorUserId);

    const request = await this.es3afniModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException({
        code: 'ES3AFNI_REQUEST_NOT_FOUND',
        userMessage: 'طلب الدم غير موجود',
      });
    }

    const requesterId = new Types.ObjectId(
      typeof request.ownerId === 'object' && request.ownerId != null
        ? String((request.ownerId as any)._id ?? request.ownerId)
        : String(request.ownerId),
    );

    if (requesterId.equals(donorId)) {
      throw new BadRequestException({
        code: 'CANNOT_CHAT_WITH_SELF',
        userMessage: 'لا يمكنك إنشاء محادثة مع نفسك',
      });
    }

    const existing = await this.conversationModel.findOne({
      requestId,
      requesterId,
      donorId,
      status: Es3afniConversationStatus.ACTIVE,
    });

    if (existing) {
      return this.maskDonorInConversation(existing);
    }

    const closesAt = new Date(
      Date.now() + CONVERSATION_TTL_HOURS * 60 * 60 * 1000,
    );
    const conversation = new this.conversationModel({
      requestId,
      requesterId,
      donorId,
      status: Es3afniConversationStatus.ACTIVE,
      unreadCountRequester: 0,
      unreadCountDonor: 0,
      closesAt,
    });

    return await conversation.save();
  }

  private maskDonorInConversation(conv: any): any {
    const c = conv.toObject ? conv.toObject() : { ...conv };
    if (c.donorId && typeof c.donorId === 'object' && c.donorId !== null && !(c.donorId instanceof Types.ObjectId)) {
      (c.donorId as any).name = (c.donorId as any).name || 'متبرع';
      (c.donorId as any).phone = undefined;
      (c.donorId as any).email = undefined;
    }
    return c;
  }

  async getConversations(userId: string, cursor?: string, limit: number = 25) {
    const userIdObj = new Types.ObjectId(userId);

    const filter: any = {
      $or: [{ requesterId: userIdObj }, { donorId: userIdObj }],
      status: Es3afniConversationStatus.ACTIVE,
    };
    if (cursor && Types.ObjectId.isValid(cursor)) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const query = this.conversationModel
      .find(filter)
      .populate('requestId', 'title bloodType urgency status expiresAt')
      .populate('requesterId', 'name email phone')
      .populate('donorId', 'name email phone')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(limit + 1);

    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage
      ? String((resultItems[resultItems.length - 1] as any)._id)
      : null;

    const processed = resultItems.map((conv: any) => {
      const c = conv.toObject ? conv.toObject() : { ...conv };
      if (c.donorId && typeof c.donorId === 'object') {
        (c.donorId as any).name = (c.donorId as any).name || 'متبرع';
        (c.donorId as any).phone = undefined;
        (c.donorId as any).email = undefined;
      }
      return c;
    });

    return { items: processed, nextCursor };
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('requestId', 'title bloodType urgency status expiresAt location')
      .populate('requesterId', 'name email phone')
      .populate('donorId', 'name email phone')
      .exec();

    if (!conversation) {
      throw new NotFoundException({
        code: 'CONVERSATION_NOT_FOUND',
        userMessage: 'المحادثة غير موجودة',
      });
    }

    const userIdObj = new Types.ObjectId(userId);
    const reqIdRaw = (conversation.requesterId as any)?._id ?? conversation.requesterId;
    const donIdRaw = (conversation.donorId as any)?._id ?? conversation.donorId;
    const isRequester = (reqIdRaw && typeof reqIdRaw.equals === 'function' && reqIdRaw.equals(userIdObj)) || String(reqIdRaw) === userId;
    const isDonor = (donIdRaw && typeof donIdRaw.equals === 'function' && donIdRaw.equals(userIdObj)) || String(donIdRaw) === userId;
    if (!isRequester && !isDonor) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        userMessage: 'ليس لديك صلاحية للوصول لهذه المحادثة',
      });
    }

    const c = conversation.toObject ? conversation.toObject() : { ...conversation };
    if (c.donorId && typeof c.donorId === 'object') {
      (c.donorId as any).name = (c.donorId as any).name || 'متبرع';
      (c.donorId as any).phone = undefined;
      (c.donorId as any).email = undefined;
    }
    return c;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendEs3afniMessageDto,
  ) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException({
        code: 'CONVERSATION_NOT_FOUND',
        userMessage: 'المحادثة غير موجودة',
      });
    }

    if (conversation.status === Es3afniConversationStatus.CLOSED) {
      throw new BadRequestException({
        code: 'CONVERSATION_CLOSED',
        userMessage: 'تم إغلاق هذه المحادثة بعد 48 ساعة',
      });
    }

    const senderIdObj = new Types.ObjectId(senderId);
    const isRequester = conversation.requesterId.equals(senderIdObj);
    const isDonor = conversation.donorId.equals(senderIdObj);
    if (!isRequester && !isDonor) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        userMessage: 'ليس لديك صلاحية لإرسال رسالة في هذه المحادثة',
      });
    }

    const message = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId: senderIdObj,
      text: dto.text,
    });
    const savedMessage = await message.save();

    conversation.lastMessage = dto.text;
    conversation.lastMessageAt = new Date();
    if (isRequester) {
      conversation.unreadCountDonor += 1;
    } else {
      conversation.unreadCountRequester += 1;
    }
    await conversation.save();

    const populated = await this.messageModel
      .findById(savedMessage._id)
      .populate('senderId', 'name email phone')
      .exec();

    const msg = populated?.toObject ? populated.toObject() : { ...populated };
    if (msg?.senderId && typeof msg.senderId === 'object') {
      const senderIdStr = String((msg.senderId as any)._id ?? msg.senderId);
      const donorIdStr = String(conversation.donorId);
      if (senderIdStr === donorIdStr) {
        (msg.senderId as any).name = (msg.senderId as any).name || 'متبرع';
        (msg.senderId as any).phone = undefined;
        (msg.senderId as any).email = undefined;
      }
    }
    return msg;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 25,
  ) {
    await this.getConversationById(conversationId, userId);

    const filter: any = { conversationId: new Types.ObjectId(conversationId) };
    if (cursor && Types.ObjectId.isValid(cursor)) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const items = await this.messageModel
      .find(filter)
      .populate('senderId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .exec();

    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage
      ? String((resultItems[resultItems.length - 1] as any)._id)
      : null;

    const conversation = await this.conversationModel
      .findById(conversationId)
      .select('donorId')
      .exec();
    const donorIdStr = conversation ? String(conversation.donorId) : '';

    const processed = resultItems.map((msg: any) => {
      const m = msg.toObject ? msg.toObject() : { ...msg };
      if (m.senderId && typeof m.senderId === 'object') {
        const sid = String((m.senderId as any)._id ?? m.senderId);
        if (sid === donorIdStr) {
          (m.senderId as any).name = (m.senderId as any).name || 'متبرع';
          (m.senderId as any).phone = undefined;
          (m.senderId as any).email = undefined;
        }
      }
      return m;
    });

    return { items: processed.reverse(), nextCursor };
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('المحادثة غير موجودة');

    const userIdObj = new Types.ObjectId(userId);
    const isRequester = conversation.requesterId.equals(userIdObj);
    if (!isRequester && !conversation.donorId.equals(userIdObj)) {
      throw new ForbiddenException('ليس لديك صلاحية');
    }

    if (isRequester) {
      conversation.unreadCountRequester = 0;
    } else {
      conversation.unreadCountDonor = 0;
    }
    await conversation.save();

    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: userIdObj },
        readAt: { $exists: false },
      },
      { readAt: new Date() },
    );

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const conversations = await this.conversationModel.find({
      $or: [{ requesterId: userIdObj }, { donorId: userIdObj }],
      status: Es3afniConversationStatus.ACTIVE,
    });

    let total = 0;
    for (const c of conversations) {
      if (c.requesterId.equals(userIdObj)) {
        total += c.unreadCountRequester;
      } else {
        total += c.unreadCountDonor;
      }
    }
    return { unreadCount: total };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async closeExpiredConversations() {
    const now = new Date();
    await this.conversationModel
      .updateMany(
        {
          status: Es3afniConversationStatus.ACTIVE,
          $or: [
            { closesAt: { $lte: now } },
            {
              closesAt: { $exists: false },
              createdAt: {
                $lte: new Date(
                  now.getTime() - CONVERSATION_TTL_HOURS * 60 * 60 * 1000,
                ),
              },
            },
          ],
        },
        { $set: { status: Es3afniConversationStatus.CLOSED } },
      )
      .exec();
  }
}
