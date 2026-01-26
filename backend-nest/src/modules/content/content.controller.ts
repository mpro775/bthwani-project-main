import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ContentService } from './services/content.service';
import {
  CreateStoreSectionDto,
  UpdateStoreSectionDto,
} from './dto/create-section.dto';
import {
  CreateSubscriptionPlanDto,
  SubscribeDto,
} from './dto/create-subscription.dto';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ==================== Store Section Endpoints ====================

  @Get('stores/:storeId/sections')
  @ApiParam({ name: 'storeId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الحصول على أقسام المتجر (public)' })
  async getStoreSections(@Param('storeId') storeId: string) {
    return this.contentService.findStoreSections(storeId);
  }

  @Post('sections')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.VENDOR_JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء قسم متجر' })
  async createStoreSection(@Body() dto: CreateStoreSectionDto) {
    return this.contentService.createStoreSection(dto);
  }

  @Patch('sections/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.VENDOR_JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث قسم' })
  async updateStoreSection(
    @Param('id') id: string,
    @Body() dto: UpdateStoreSectionDto,
  ) {
    return this.contentService.updateStoreSection(id, dto);
  }

  @Delete('sections/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.VENDOR_JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف قسم' })
  async deleteStoreSection(@Param('id') id: string) {
    await this.contentService.deleteStoreSection(id);
    return { message: 'تم حذف القسم بنجاح' };
  }

  // ==================== Subscription Endpoints ====================

  @Get('subscription-plans')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الحصول على خطط الاشتراك (public)' })
  async getSubscriptionPlans() {
    return this.contentService.findAllSubscriptionPlans();
  }

  @Post('subscription-plans')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء خطة اشتراك' })
  async createSubscriptionPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.contentService.createSubscriptionPlan(dto);
  }

  @Post('subscribe')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الاشتراك في خطة' })
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.contentService.subscribe(userId, dto);
  }

  @Get('my-subscription')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على اشتراكي' })
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.contentService.getMySubscription(userId);
  }

  @Patch('my-subscription/cancel')
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إلغاء الاشتراك' })
  async cancelSubscription(
    @CurrentUser('id') userId: string,
    @Body() dto: { reason: string },
  ) {
    return this.contentService.cancelSubscription(userId, dto.reason);
  }

  // ==================== CMS Pages ====================

  @Get('pages')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الحصول على صفحات CMS (public)' })
  async getCMSPages(@Query('type') type?: string) {
    return this.contentService.getCMSPages(type);
  }

  @Get('pages/:slug')
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الحصول على صفحة CMS بالـ slug' })
  async getCMSPageBySlug(@Param('slug') slug: string) {
    return this.contentService.getCMSPageBySlug(slug);
  }


  // ==================== App Settings ====================

  @Get('app-settings')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إعدادات التطبيق (public)' })
  async getAppSettings() {
    return this.contentService.getAppSettings();
  }

  @Patch('admin/app-settings')
  @ApiBody({ schema: { type: 'object', properties: { minAppVersion: { type: 'string' }, maintenanceMode: { type: 'boolean' }, supportEmail: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث إعدادات التطبيق' })
  async updateAppSettings(
    @Body() body: any,
    @CurrentUser('id') adminId: string,
  ) {
    return this.contentService.updateAppSettings(body, adminId);
  }

  // ==================== FAQs ====================

  @Get('faqs')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الأسئلة الشائعة (public)' })
  async getFAQs(@Query('category') category?: string) {
    return this.contentService.getFAQs(category);
  }

  @Post('admin/faqs')
  @ApiBody({ schema: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' }, category: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إضافة سؤال شائع' })
  async createFAQ(@Body() body: any) {
    return this.contentService.createFAQ(body);
  }

  @Patch('admin/faqs/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث سؤال شائع' })
  async updateFAQ(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateFAQ(id, body);
  }

  @Delete('admin/faqs/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف سؤال شائع' })
  async deleteFAQ(@Param('id') id: string) {
    return this.contentService.deleteFAQ(id);
  }
}
