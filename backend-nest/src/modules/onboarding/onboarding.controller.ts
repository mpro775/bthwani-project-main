import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MarketerService } from '../marketer/marketer.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { QuickOnboardDto } from './dto/quick-onboard.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { normalizeOnboardingBody, normalizeUpdateBody } from './onboarding.normalizer';

@ApiTags('Onboarding')
@ApiBearerAuth()
@Controller('onboarding')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class OnboardingController {
  constructor(private readonly marketerService: MarketerService) {}

  // ==================== Marketer Onboarding ====================

  @Auth(AuthType.MARKETER_JWT)
  @Post()
  @ApiBody({ type: CreateOnboardingDto, description: 'أو شكل التطبيق: storeDraft { name, address, location }, ownerDraft { fullName, phone, email }' })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء طلب الانضمام',
    schema: {
      example: {
        success: true,
        data: { _id: '...', id: '...', storeName: '...', ownerName: '...', phone: '...', type: 'store', status: 'draft', marketer: '...', createdAt: '...' },
        message: 'تم إرسال طلب الانضمام بنجاح',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل متجر/تاجر جديد' })
  async createOnboarding(
    @CurrentUser('id') marketerId: string,
    @Body() body: CreateOnboardingDto | Record<string, any>,
  ) {
    const normalized = normalizeOnboardingBody(body);
    const created = await this.marketerService.createOnboarding(marketerId, normalized);
    const data = created.toObject ? created.toObject() : (created as any);
    return {
      success: true,
      data: { _id: data._id, ...data, id: String(data._id) },
      message: 'تم إرسال طلب الانضمام بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Get('my')
  @ApiQuery({ name: 'status', required: false, description: 'draft | pending | submitted | needs_fix | approved | rejected' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date' })
  @ApiResponse({
    status: 200,
    description: 'قائمة طلبات الانضمام مع الترقيم',
    schema: {
      example: {
        success: true,
        data: {
          items: [{ _id: '...', storeName: '...', ownerName: '...', phone: '...', status: 'draft', type: 'store', marketer: '...', createdAt: '...' }],
          pagination: { page: 1, limit: 20, total: 5, totalPages: 1 },
          total: 5,
        },
        message: 'جلب طلبات التسجيل بنجاح',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلبات التسجيل الخاصة بي' })
  async getMyOnboardings(
    @CurrentUser('id') marketerId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.marketerService.getMyOnboardings(
      marketerId,
      status,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      from,
      to,
    );
    return {
      success: true,
      data: {
        items: result.items ?? result.data,
        pagination: result.pagination,
        total: result.total,
      },
      message: 'جلب طلبات التسجيل بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل طلب انضمام واحد',
    schema: {
      example: {
        success: true,
        data: {
          id: '...',
          _id: '...',
          storeName: '...',
          ownerName: '...',
          phone: '...',
          email: '...',
          address: { street: '...', city: '...', location: { lat: 0, lng: 0 } },
          type: 'store',
          status: 'draft',
          marketer: '...',
          createdAt: '...',
          updatedAt: '...',
        },
        message: 'جلب تفاصيل الطلب بنجاح',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفاصيل طلب انضمام (للمسوق)' })
  async getOnboardingById(
    @CurrentUser('id') marketerId: string,
    @Param('id') id: string,
  ) {
    const data = await this.marketerService.getOnboardingDetailsForMarketer(
      id,
      marketerId,
    );
    return {
      success: true,
      data: { ...data, id: (data as any)._id?.toString?.() ?? (data as any)._id },
      message: 'جلب تفاصيل الطلب بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Post('quick-onboard')
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء طلب انضمام سريع (status: pending)',
    schema: {
      example: {
        success: true,
        data: { _id: '...', id: '...', storeName: '...', ownerName: '...', phone: '...', type: 'store', status: 'pending', marketer: '...', createdAt: '...' },
        message: 'تم التسجيل السريع بنجاح',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل سريع' })
  async quickOnboard(
    @CurrentUser('id') marketerId: string,
    @Body() body: QuickOnboardDto,
  ) {
    const created = await this.marketerService.quickOnboard(marketerId, body);
    const data = created.toObject ? created.toObject() : (created as any);
    return {
      success: true,
      data: { _id: data._id, ...data, id: String(data._id) },
      message: 'تم التسجيل السريع بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث طلب انضمام (مسودة) — يقبل شكل التطبيق أو الباك' })
  async updateOnboarding(
    @CurrentUser('id') marketerId: string,
    @Param('id') id: string,
    @Body() body: UpdateOnboardingDto | Record<string, unknown>,
  ) {
    const normalized = normalizeUpdateBody(body as any);
    const data = await this.marketerService.updateOnboardingByMarketer(
      id,
      marketerId,
      normalized,
    );
    return {
      success: true,
      data: { ...data, id: (data as any)?._id?.toString?.() ?? (data as any)?._id },
      message: 'تم تحديث الطلب',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Post(':id/submit')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Submitted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفع طلب الانضمام' })
  async submitOnboarding(
    @CurrentUser('id') marketerId: string,
    @Param('id') id: string,
  ) {
    const data = await this.marketerService.submitOnboardingByMarketer(
      id,
      marketerId,
    );
    return {
      success: true,
      data: { ...data, id: (data as any)?._id?.toString?.() ?? (data as any)?._id },
      message: 'تم رفع الطلب بنجاح',
    };
  }

  // ==================== Admin Onboarding Management ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('applications')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلبات الانضمام (Admin)' })
  async getOnboardingApplications(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return {
      success: true,
      data: [],
      status,
      type,
      page,
      limit,
      message: 'جلب طلبات الانضمام بنجاح',
    };
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get(':id/details')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفاصيل طلب انضمام' })
  async getOnboardingDetails(@Param('id') applicationId: string) {
    return {
      success: true,
      data: { applicationId },
      message: 'جلب تفاصيل الطلب بنجاح',
    };
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch(':id/approve')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الموافقة على طلب انضمام' })
  async approveOnboarding(
    @Param('id') applicationId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return {
      success: true,
      data: { applicationId, adminId, status: 'approved' },
      message: 'تمت الموافقة على الطلب بنجاح',
    };
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch(':id/reject')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفض طلب انضمام' })
  async rejectOnboarding(
    @Param('id') applicationId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return {
      success: true,
      data: { applicationId, adminId, status: 'rejected', reason: body.reason },
      message: 'تم رفض الطلب',
    };
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('statistics')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات الانضمام' })
  async getOnboardingStatistics() {
    return {
      success: true,
      data: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      message: 'جلب الإحصائيات بنجاح',
    };
  }
}

