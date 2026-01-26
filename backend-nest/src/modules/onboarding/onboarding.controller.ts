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
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Onboarding')
@ApiBearerAuth()
@Controller('onboarding')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class OnboardingController {
  // ==================== Marketer Onboarding ====================

  @Auth(AuthType.MARKETER_JWT)
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل متجر/تاجر جديد' })
  async createOnboarding(
    @CurrentUser('id') marketerId: string,
    @Body()
    body: {
      storeName: string;
      ownerName: string;
      phone: string;
      email?: string;
      address: any;
      type: 'store' | 'vendor' | 'driver';
    },
  ) {
    return {
      success: true,
      data: { ...body, marketerId, status: 'pending' },
      message: 'تم إرسال طلب الانضمام بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Get('my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلبات التسجيل الخاصة بي' })
  async getMyOnboardings(
    @CurrentUser('id') marketerId: string,
    @Query('status') status?: string,
  ) {
    return {
      success: true,
      data: [],
      marketerId,
      status,
      message: 'جلب طلبات التسجيل بنجاح',
    };
  }

  @Auth(AuthType.MARKETER_JWT)
  @Post('quick-onboard')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل سريع' })
  async quickOnboard(
    @CurrentUser('id') marketerId: string,
    @Body() body: { phone: string; storeName: string; location: any },
  ) {
    return {
      success: true,
      data: { ...body, marketerId, status: 'pending' },
      message: 'تم التسجيل السريع بنجاح',
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

