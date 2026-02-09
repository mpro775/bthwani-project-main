import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RewardHoldService } from './reward-hold.service';
import { MaaroufService } from './maarouf.service';
import CreateMaaroufDto from './dto/create-maarouf.dto';
import UpdateMaaroufDto from './dto/update-maarouf.dto';

@ApiTags('معروف — المفقودات والموجودات')
@ApiBearerAuth()
@ApiConsumes('application/json', 'multipart/form-data')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller('maarouf')
export class MaaroufController {
  constructor(
    private readonly service: MaaroufService,
    private readonly rewardHoldService: RewardHoldService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('نوع الملف غير مدعوم. يُقبل فقط: JPEG, PNG, GIF, WebP') as any, false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'رفع صورة', description: 'رفع صورة لإعلان مفقود أو موجود' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'ملف الصورة' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم رفع الصورة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'لم يتم اختيار ملف' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('لم يتم اختيار ملف للرفع');
    }
    return this.service.uploadImage(file);
  }

  @Post()
  @ApiOperation({ 
    summary: 'إنشاء إعلان مفقود أو موجود',
    description: 'إضافة إعلان جديد للمفقودات أو الموجودات مع تحديد النوع والعلامات'
  })
  @ApiBody({
    description: 'بيانات الإعلان',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'محفظة سوداء مفقودة في منطقة النرجس' },
        description: { type: 'string', example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال' },
        kind: { type: 'string', enum: ['lost', 'found'], example: 'lost' },
        tags: { type: 'array', items: { type: 'string' }, example: ['محفظة', 'بطاقات', 'نرجس'] },
        metadata: { type: 'object', example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], default: 'draft' },
        mediaUrls: { type: 'array', items: { type: 'string' }, example: ['https://example.com/img1.jpg'] },
        category: { type: 'string', enum: ['phone','pet','id','wallet','keys','bag','other'], example: 'wallet' },
        reward: { type: 'number', example: 500 },
        location: { type: 'object', properties: { type: { enum: ['Point'] }, coordinates: { type: 'array', items: { type: 'number' } } } },
        deliveryToggle: { type: 'boolean', default: false },
        isAnonymous: { type: 'boolean', default: false },
        expiresAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الإعلان بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateMaaroufDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'قائمة الإعلانات',
    description: 'استرجاع قائمة إعلانات المفقودات والموجودات؛ المسودة تظهر فقط لصاحب الطلب'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'category', required: false, description: 'فلترة حسب التصنيف', enum: ['phone', 'pet', 'id', 'wallet', 'keys', 'bag', 'other'] })
  @ApiQuery({ name: 'hasReward', required: false, description: 'عرض الإعلانات ذات المكافأة فقط', type: Boolean })
  @ApiQuery({ name: 'near', required: false, description: 'البحث الجغرافي: lat,lng (مثال: 15.35,44.2)', type: String })
  @ApiQuery({ name: 'radius', required: false, description: 'نصف القطر بالكيلومتر (افتراضي: 10)', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(
    @Query('cursor') cursor?: string,
    @Query('category') category?: string,
    @Query('hasReward') hasReward?: string,
    @Query('near') near?: string,
    @Query('radius') radius?: string,
    @Req() req?: { user?: { id: string } },
  ) {
    const userId = req?.user?.id;
    return this.service.findAll({
      cursor,
      userId,
      category,
      hasReward: hasReward === 'true' || hasReward === '1',
      near,
      radius: radius ? Number(radius) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل إعلان', description: 'استرجاع إعلان مفقود أو موجود بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث إعلان', description: 'تحديث بيانات إعلان المفقودات أو الموجودات' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'محفظة سوداء محدثة' },
        description: { type: 'string', example: 'تفاصيل محدثة للمحفظة' },
        kind: { type: 'string', enum: ['lost', 'found'], example: 'found' },
        tags: { type: 'array', items: { type: 'string' }, example: ['محفظة', 'أسود', 'موجودة'] },
        metadata: { type: 'object', example: { color: 'أسود', location: 'الروضة', date: '2024-01-16' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateMaaroufDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إعلان', description: 'حذف إعلان المفقودات أو الموجودات نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ==== Delivery / Rider tasks ====

  @Post(':id/assign-delivery')
  @ApiOperation({
    summary: 'تعيين طلب توصيل لإعلان معروف',
    description:
      'يستخدم لربط إعلان معروف بطلب توصيل موجود (أو بسائقة معيّنة) عبر تخزين deliveryId في السجل.',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deliveryId: {
          type: 'string',
          description: 'معرف طلب التوصيل أو السائقة حسب تصميم موديول التوصيل',
        },
      },
      required: ['deliveryId'],
    },
  })
  assignDelivery(
    @Param('id') id: string,
    @Body('deliveryId') deliveryId: string,
  ) {
    return this.service.assignDelivery(id, deliveryId);
  }

  @Get('deliveries/list')
  @ApiOperation({
    summary: 'قائمة طلبات التوصيل لخدمة معروف',
    description:
      'تعيد الإعلانات التي عليها deliveryToggle=true، ويمكن استخدامها في تطبيق السائقات لعرض مهام التوصيل.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  getDeliveryTasks(@Req() req: { user?: { id: string } }) {
    const driverId = req?.user?.id;
    return this.service.findDeliveryTasks(driverId);
  }

  // ==== Reward Holds (Escrow) ====

  @Post(':id/reward-hold')
  @ApiOperation({
    summary: 'حجز مكافأة في المحفظة',
    description:
      'يقوم صاحب الإعلان بحجز مبلغ المكافأة في المحفظة بنظام Escrow. يتطلب أن يكون للمستخدم رصيد كافٍ.',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم حجز المكافأة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة أو رصيد غير كافٍ' })
  createRewardHold(@Param('id') id: string, @Req() req: { user?: { id: string } }) {
    if (!req?.user?.id) {
      throw new BadRequestException('لم يتم العثور على هوية المستخدم');
    }
    return this.rewardHoldService.createHold(req.user.id, id);
  }

  @Post(':id/reward-hold/:holdId/assign-claimer')
  @ApiOperation({
    summary: 'تعيين مستلم المكافأة',
    description:
      'استخدامها لتحديد المستخدم الذي سيتم تحويل المكافأة إليه عند الإطلاق (مثلاً: من وجد المفقود).',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف' })
  @ApiParam({ name: 'holdId', description: 'معرف حجز المكافأة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        claimerId: { type: 'string', description: 'معرف المستلم (User)' },
      },
      required: ['claimerId'],
    },
  })
  assignRewardClaimer(
    @Param('id') _id: string,
    @Param('holdId') holdId: string,
    @Body('claimerId') claimerId: string,
  ) {
    return this.rewardHoldService.assignClaimer(holdId, claimerId);
  }

  @Post(':id/reward-hold/:holdId/release')
  @ApiOperation({
    summary: 'إطلاق المكافأة للمستلم',
    description:
      'بعد تأكيد التسليم (مثلاً عبر OTP أو من لوحة التحكم) يتم إطلاق المبلغ من المؤسس إلى المستلم.',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف' })
  @ApiParam({ name: 'holdId', description: 'معرف حجز المكافأة' })
  releaseRewardHold(@Param('id') _id: string, @Param('holdId') holdId: string) {
    return this.rewardHoldService.releaseHold(holdId);
  }

  @Post(':id/reward-hold/:holdId/refund')
  @ApiOperation({
    summary: 'استرداد المبلغ المحجوز إلى المؤسس',
    description: 'إلغاء حجز المكافأة وإرجاع المبلغ إلى رصيد صاحب الإعلان.',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف' })
  @ApiParam({ name: 'holdId', description: 'معرف حجز المكافأة' })
  refundRewardHold(@Param('id') _id: string, @Param('holdId') holdId: string) {
    return this.rewardHoldService.refundHold(holdId);
  }

  @Post(':id/reward-hold/:holdId/verify-code')
  @ApiOperation({
    summary: 'التحقق من رمز الاستلام وإطلاق المكافأة',
    description:
      'السائقة/الموصل يدخل رمز الاستلام (OTP / PIN) من المستلم، وعند تطابقه يتم إطلاق المكافأة من Escrow إلى المستلم.',
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف' })
  @ApiParam({ name: 'holdId', description: 'معرف حجز المكافأة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'رمز الاستلام (أرقام)' },
      },
      required: ['code'],
    },
  })
  verifyRewardCode(
    @Param('id') _id: string,
    @Param('holdId') holdId: string,
    @Body('code') code: string,
  ) {
    return this.rewardHoldService.verifyCodeAndRelease(holdId, code);
  }

  @Get(':id/reward-holds')
  @ApiOperation({
    summary: 'قائمة حجوزات المكافآت لإعلان معين',
    description: 'تُستخدم في لوحة التحكم أو شاشة التفاصيل لعرض حالات المكافآت المحجوزة.',
  })
  listRewardHolds(@Param('id') id: string) {
    return this.rewardHoldService.listByMaarouf(id);
  }

  // ==== Matching Service ====

  @Post('match')
  @ApiOperation({
    summary: 'البحث عن إعلانات مطابقة',
    description:
      'يبحث عن إعلانات مطابقة لإعلان معين بناءً على category + tags + location قريب. يُستخدم للعثور على lost↔found.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        maaroufId: { type: 'string', description: 'معرف الإعلان المراد البحث عن مطابقات له' },
        maxDistanceKm: {
          type: 'number',
          description: 'أقصى مسافة بالكيلومتر (افتراضي: 5)',
          default: 5,
        },
      },
      required: ['maaroufId'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  findMatches(@Body('maaroufId') maaroufId: string, @Body('maxDistanceKm') maxDistanceKm?: number) {
    return this.service.findMatches(maaroufId, maxDistanceKm);
  }

  @Patch(':id/link')
  @ApiOperation({
    summary: 'ربط يدوي بين lost و found',
    description: 'ربط إعلانين (lost↔found) يدوياً عبر matchedToId.',
  })
  @ApiParam({ name: 'id', description: 'معرف الإعلان الأول' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        matchedToId: { type: 'string', description: 'معرف الإعلان المطابق (المربوط)' },
      },
      required: ['matchedToId'],
    },
  })
  linkMatch(@Param('id') id: string, @Body('matchedToId') matchedToId: string) {
    return this.service.linkMatch(id, matchedToId);
  }
}
