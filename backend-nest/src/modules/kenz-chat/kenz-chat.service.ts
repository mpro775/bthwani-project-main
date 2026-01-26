import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KenzConversation, ConversationStatus } from './entities/kenz-conversation.entity';
import { KenzMessage } from './entities/kenz-message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class KenzChatService {
  constructor(
    @InjectModel(KenzConversation.name)
    private conversationModel: Model<KenzConversation>,
    @InjectModel(KenzMessage.name)
    private messageModel: Model<KenzMessage>,
    @InjectModel('Kenz')
    private kenzModel: Model<any>,
  ) {}

  async createConversation(dto: CreateConversationDto, interestedUserId: string) {
    const kenzId = new Types.ObjectId(dto.kenzId);
    
    // التحقق من وجود الإعلان
    const kenz = await this.kenzModel.findById(kenzId);
    if (!kenz) {
      throw new NotFoundException({
        code: 'KENZ_NOT_FOUND',
        userMessage: 'الإعلان غير موجود',
      });
    }

    const ownerId = new Types.ObjectId(kenz.ownerId.toString());
    const interestedId = new Types.ObjectId(interestedUserId);

    // منع المستخدم من إنشاء محادثة مع نفسه
    if (ownerId.equals(interestedId)) {
      throw new BadRequestException({
        code: 'CANNOT_CHAT_WITH_SELF',
        userMessage: 'لا يمكنك إنشاء محادثة مع نفسك',
      });
    }

    // التحقق من وجود محادثة موجودة
    const existing = await this.conversationModel.findOne({
      kenzId,
      ownerId,
      interestedUserId: interestedId,
      status: ConversationStatus.ACTIVE,
    });

    if (existing) {
      return existing;
    }

    // إنشاء محادثة جديدة
    const conversation = new this.conversationModel({
      kenzId,
      ownerId,
      interestedUserId: interestedId,
      status: ConversationStatus.ACTIVE,
      unreadCountOwner: 0,
      unreadCountInterested: 0,
    });

    return await conversation.save();
  }

  async getConversations(userId: string, cursor?: string, limit: number = 25) {
    const userIdObj = new Types.ObjectId(userId);
    
    const query = this.conversationModel
      .find({
        $or: [
          { ownerId: userIdObj },
          { interestedUserId: userIdObj },
        ],
        status: ConversationStatus.ACTIVE,
      })
      .populate('kenzId', 'title price category status')
      .populate('ownerId', 'name email phone')
      .populate('interestedUserId', 'name email phone')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    if (cursor) {
      query.where('_id').lt(new Types.ObjectId(cursor));
    }

    query.limit(limit + 1);
    const items = await query.exec();
    
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage
      ? String(resultItems[resultItems.length - 1]._id)
      : null;

    return { items: resultItems, nextCursor };
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('kenzId', 'title price category status description metadata')
      .populate('ownerId', 'name email phone')
      .populate('interestedUserId', 'name email phone')
      .exec();

    if (!conversation) {
      throw new NotFoundException({
        code: 'CONVERSATION_NOT_FOUND',
        userMessage: 'المحادثة غير موجودة',
      });
    }

    const userIdObj = new Types.ObjectId(userId);
    const isOwner = conversation.ownerId.equals(userIdObj);
    const isInterested = conversation.interestedUserId.equals(userIdObj);

    if (!isOwner && !isInterested) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        userMessage: 'ليس لديك صلاحية للوصول لهذه المحادثة',
      });
    }

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, dto: SendMessageDto) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException({
        code: 'CONVERSATION_NOT_FOUND',
        userMessage: 'المحادثة غير موجودة',
      });
    }

    const senderIdObj = new Types.ObjectId(senderId);
    const isOwner = conversation.ownerId.equals(senderIdObj);
    const isInterested = conversation.interestedUserId.equals(senderIdObj);

    if (!isOwner && !isInterested) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        userMessage: 'ليس لديك صلاحية لإرسال رسالة في هذه المحادثة',
      });
    }

    // إنشاء الرسالة
    const message = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId: senderIdObj,
      text: dto.text,
    });

    const savedMessage = await message.save();

    // تحديث المحادثة
    conversation.lastMessage = dto.text;
    conversation.lastMessageAt = new Date();

    // تحديث عدد الرسائل غير المقروءة
    if (isOwner) {
      conversation.unreadCountInterested += 1;
    } else {
      conversation.unreadCountOwner += 1;
    }

    await conversation.save();

    // إرجاع الرسالة مع populate
    return await this.messageModel
      .findById(savedMessage._id)
      .populate('senderId', 'name email phone')
      .exec();
  }

  async getMessages(conversationId: string, userId: string, cursor?: string, limit: number = 25) {
    // التحقق من الصلاحيات
    await this.getConversationById(conversationId, userId);

    const query = this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .populate('senderId', 'name email phone')
      .sort({ createdAt: -1 });

    if (cursor) {
      query.where('_id').lt(new Types.ObjectId(cursor));
    }

    query.limit(limit + 1);
    const items = await query.exec();

    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage
      ? String(resultItems[resultItems.length - 1]._id)
      : null;

    return { items: resultItems.reverse(), nextCursor };
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.getConversationById(conversationId, userId);
    
    const userIdObj = new Types.ObjectId(userId);
    const isOwner = conversation.ownerId.equals(userIdObj);

    // تحديث عدد الرسائل غير المقروءة
    if (isOwner) {
      conversation.unreadCountOwner = 0;
    } else {
      conversation.unreadCountInterested = 0;
    }

    await conversation.save();

    // تحديث readAt للرسائل غير المقروءة
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: userIdObj },
        readAt: { $exists: false },
      },
      {
        readAt: new Date(),
      },
    );

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const userIdObj = new Types.ObjectId(userId);
    
    const conversations = await this.conversationModel.find({
      $or: [
        { ownerId: userIdObj },
        { interestedUserId: userIdObj },
      ],
      status: ConversationStatus.ACTIVE,
    });

    let totalUnread = 0;
    conversations.forEach((conv) => {
      if (conv.ownerId.equals(userIdObj)) {
        totalUnread += conv.unreadCountOwner;
      } else {
        totalUnread += conv.unreadCountInterested;
      }
    });

    return { unreadCount: totalUnread };
  }
}
