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
import { Request } from 'express';
import { KenzChatService } from './kenz-chat.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthenticatedRequest extends Request {
  user: {
    _id?: string;
    id?: string;
  };
}

@ApiTags('كنز — المحادثات')
@ApiBearerAuth()
@Controller('kenz-chat')
@UseGuards(UnifiedAuthGuard)
export class KenzChatController {
  constructor(private readonly kenzChatService: KenzChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'إنشاء محادثة جديدة', description: 'إنشاء محادثة جديدة لإعلان كنز' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء المحادثة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id || req.user.id || '';
    return this.kenzChatService.createConversation(dto, userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'قائمة المحادثات', description: 'جلب محادثات المستخدم مع دعم cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getConversations(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const userId = req?.user._id || req?.user.id || '';
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.kenzChatService.getConversations(userId, cursor, limitNum);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'تفاصيل محادثة', description: 'جلب تفاصيل محادثة معينة' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getConversationById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id || req.user.id || '';
    return this.kenzChatService.getConversationById(id, userId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'إرسال رسالة', description: 'إرسال رسالة في محادثة' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إرسال الرسالة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const senderId = req.user._id || req.user.id || '';
    return this.kenzChatService.sendMessage(conversationId, senderId, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'قائمة الرسائل', description: 'جلب رسائل محادثة مع دعم cursor' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getMessages(
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const userId = req?.user._id || req?.user.id || '';
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.kenzChatService.getMessages(conversationId, userId, cursor, limitNum);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'تحديد كمقروء', description: 'تحديد جميع الرسائل في محادثة كمقروءة' })
  @ApiParam({ name: 'id', description: 'معرف المحادثة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'المحادثة غير موجودة' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس لديك صلاحية' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async markAsRead(
    @Param('id') conversationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user._id || req.user.id || '';
    return this.kenzChatService.markAsRead(conversationId, userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'عدد الرسائل غير المقروءة', description: 'جلب عدد الرسائل غير المقروءة للمستخدم' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const userId = req.user._id || req.user.id || '';
    return this.kenzChatService.getUnreadCount(userId);
  }
}
