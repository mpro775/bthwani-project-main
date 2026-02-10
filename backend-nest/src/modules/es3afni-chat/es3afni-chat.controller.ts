import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Es3afniChatService } from './es3afni-chat.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { CreateEs3afniConversationDto } from './dto/create-conversation.dto';
import { SendEs3afniMessageDto } from './dto/send-message.dto';

interface AuthenticatedRequest extends Request {
  user?: { _id?: string; id?: string };
}

@ApiTags('اسعفني — محادثات الطلبات')
@ApiBearerAuth()
@Controller('es3afni-chat')
@UseGuards(UnifiedAuthGuard)
export class Es3afniChatController {
  constructor(private readonly chatService: Es3afniChatService) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'إنشاء محادثة مع طلب دم',
    description: 'المتبرع ينشئ محادثة مع صاحب الطلب (بقبول التبرع)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء المحادثة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'طلب الدم غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  createConversation(
    @Body() dto: CreateEs3afniConversationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.chatService.createConversation(dto, userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'قائمة محادثات اسعفني', description: 'جلب محادثات المستخدم مع دعم cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getConversations(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const userId = req?.user?._id ?? req?.user?.id ?? '';
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.chatService.getConversations(userId, cursor, limitNum);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'قائمة الرسائل', description: 'جلب رسائل محادثة مع دعم cursor' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMessages(
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const userId = req?.user?._id ?? req?.user?.id ?? '';
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.chatService.getMessages(conversationId, userId, cursor, limitNum);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'تفاصيل محادثة', description: 'جلب تفاصيل محادثة اسعفني' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getConversationById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.chatService.getConversationById(id, userId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'إرسال رسالة', description: 'إرسال رسالة في محادثة (تُقفل تلقائياً بعد 48 ساعة)' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إرسال الرسالة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'المحادثة مغلقة أو بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendEs3afniMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const senderId = req.user?._id ?? req.user?.id ?? '';
    return this.chatService.sendMessage(conversationId, senderId, dto);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'تحديد كمقروء', description: 'تحديد رسائل المحادثة كمقروءة' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  markAsRead(
    @Param('id') conversationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.chatService.markAsRead(conversationId, userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'عدد الرسائل غير المقروءة', description: 'جلب عدد الرسائل غير المقروءة لمحادثات اسعفني' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getUnreadCount(@Req() req: AuthenticatedRequest) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.chatService.getUnreadCount(userId);
  }
}
