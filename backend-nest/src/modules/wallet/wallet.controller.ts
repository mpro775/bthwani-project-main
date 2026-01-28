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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { WalletUsersFilterDto } from './dto/wallet-users-filter.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller({ path: 'wallet', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Auth(AuthType.JWT)
  @SkipThrottle() // ✅ لا rate limiting على القراءة
  @Get('balance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب رصيد المحفظة',
    description: 'الحصول على الرصيد الحالي والرصيد المحجوز',
  })
  @ApiResponse({ status: 200, description: 'رصيد المحفظة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getWalletBalance(userId);
  }

  @Auth(AuthType.JWT)
  @Get('transactions')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب سجل المعاملات',
    description: 'الحصول على جميع معاملات المحفظة مع pagination',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'قائمة المعاملات' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTransactions(userId, pagination);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Throttle({ strict: { ttl: 60000, limit: 10 } }) // ✅ 10 معاملات في الدقيقة (admin)
  @Post('transaction')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إنشاء معاملة جديدة (للإدارة)',
    description: 'إنشاء معاملة credit/debit يدوياً (admin only)',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء المعاملة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.walletService.createTransaction(createTransactionDto);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post('hold')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'حجز مبلغ (Escrow)',
    description: 'حجز مبلغ من المحفظة لضمان الدفع',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        amount: { type: 'number' },
        orderId: { type: 'string' },
      },
      required: ['userId', 'amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم حجز المبلغ بنجاح' })
  @ApiResponse({ status: 400, description: 'رصيد غير كافٍ' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async holdFunds(
    @Body() body: { userId: string; amount: number; orderId?: string },
  ) {
    return this.walletService.holdFunds(body.userId, body.amount, body.orderId);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post('release')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إطلاق المبلغ المحجوز',
    description: 'إطلاق المبلغ المحجوز بعد تأكيد الطلب',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        amount: { type: 'number' },
        orderId: { type: 'string' },
      },
      required: ['userId', 'amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم إطلاق المبلغ بنجاح' })
  @ApiResponse({ status: 404, description: 'المبلغ المحجوز غير موجود' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async releaseFunds(
    @Body() body: { userId: string; amount: number; orderId?: string },
  ) {
    return this.walletService.releaseFunds(
      body.userId,
      body.amount,
      body.orderId,
    );
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post('refund')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إرجاع المبلغ المحجوز',
    description: 'إرجاع المبلغ إلى المحفظة عند إلغاء الطلب',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        amount: { type: 'number' },
        orderId: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['userId', 'amount', 'reason'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم الإرجاع بنجاح' })
  @ApiResponse({ status: 404, description: 'المعاملة غير موجودة' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async refundFunds(
    @Body() body: { userId: string; amount: number; orderId?: string },
  ) {
    return this.walletService.refundHeldFunds(
      body.userId,
      body.amount,
      body.orderId,
    );
  }

  // ==================== Topup (Kuraimi) ====================

  @Auth(AuthType.JWT)
  @Post('topup/kuraimi')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'شحن المحفظة عبر كريمي',
    description: 'شحن المحفظة باستخدام بطاقة كريمي',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'المبلغ' },
        SCustID: { type: 'string', description: 'رقم بطاقة كريمي' },
        PINPASS: { type: 'string', description: 'الرمز السري' },
      },
      required: ['amount', 'SCustID', 'PINPASS'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم الشحن بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة أو فشل الدفع' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async topupViaKuraimi(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      amount: number;
      SCustID: string;
      PINPASS: string;
    },
  ) {
    return this.walletService.topupViaKuraimi(
      userId,
      body.amount,
      body.SCustID,
      body.PINPASS,
    );
  }

  @Auth(AuthType.JWT)
  @Post('topup/verify')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'التحقق من عملية الشحن',
    description: 'التحقق من نجاح عملية الشحن عبر معرّف المعاملة',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', description: 'معرّف المعاملة' },
      },
      required: ['transactionId'],
    },
  })
  @ApiResponse({ status: 200, description: 'المعاملة ناجحة' })
  @ApiResponse({ status: 404, description: 'المعاملة غير موجودة' })
  @ApiResponse({ status: 400, description: 'المعاملة فاشلة' })
  async verifyTopup(
    @CurrentUser('id') userId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.walletService.verifyTopup(userId, body.transactionId);
  }

  @Auth(AuthType.JWT)
  @Get('topup/history')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'سجل عمليات الشحن',
    description: 'الحصول على سجل جميع عمليات الشحن السابقة',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'سجل عمليات الشحن' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getTopupHistory(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTopupHistory(userId, pagination);
  }

  @Auth(AuthType.JWT)
  @Get('topup/methods')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طرق الشحن المتاحة',
    description: 'الحصول على قائمة طرق الشحن المدعومة (كريمي، بطاقة، وكيل)',
  })
  @ApiResponse({ status: 200, description: 'قائمة طرق الشحن' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getTopupMethods() {
    return this.walletService.getTopupMethods();
  }

  // ==================== Withdrawals ====================

  @Auth(AuthType.JWT)
  @Throttle({ strict: { ttl: 60000, limit: 10 } }) // ✅ 10 طلبات سحب في الدقيقة
  @Post('withdraw/request')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طلب سحب من المحفظة',
    description: 'إنشاء طلب سحب مبلغ إلى الحساب البنكي',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'المبلغ المراد سحبه' },
        method: {
          type: 'string',
          enum: ['bank_transfer', 'agent'],
          description: 'طريقة السحب',
        },
        accountInfo: { type: 'object', description: 'بيانات الحساب البنكي' },
      },
      required: ['amount', 'method', 'accountInfo'],
    },
  })
  @ApiResponse({ status: 201, description: 'تم إنشاء طلب السحب بنجاح' })
  @ApiResponse({
    status: 400,
    description: 'رصيد غير كافٍ أو بيانات غير صالحة',
  })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async requestWithdrawal(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      amount: number;
      method: string;
      accountInfo: Record<string, unknown>;
    },
  ) {
    return this.walletService.requestWithdrawal(
      userId,
      body.amount,
      body.method,
      body.accountInfo,
    );
  }

  @Auth(AuthType.JWT)
  @Get('withdraw/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طلبات السحب الخاصة بي',
    description: 'الحصول على قائمة طلبات السحب مع حالاتها',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'قائمة طلبات السحب' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getMyWithdrawals(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getMyWithdrawals(userId, pagination);
  }

  @Auth(AuthType.JWT)
  @Patch('withdraw/:id/cancel')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إلغاء طلب سحب',
    description: 'إلغاء طلب سحب قيد المعالجة',
  })
  @ApiParam({ name: 'id', description: 'معرّف طلب السحب' })
  @ApiResponse({ status: 200, description: 'تم إلغاء طلب السحب بنجاح' })
  @ApiResponse({ status: 404, description: 'طلب السحب غير موجود' })
  @ApiResponse({ status: 400, description: 'لا يمكن إلغاء طلب السحب' })
  async cancelWithdrawal(
    @Param('id') withdrawalId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletService.cancelWithdrawal(withdrawalId, userId);
  }

  @Auth(AuthType.JWT)
  @Get('withdraw/methods')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWithdrawalMethods() {
    return this.walletService.getWithdrawMethods();
  }

  // ==================== Admin Withdrawal Management ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/withdrawals')
  @ApiOperation({ summary: 'جلب طلبات السحب (Admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userModel', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllWithdrawals(
    @Query('status') status?: string,
    @Query('userModel') userModel?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.walletService.getAllWithdrawals({
      status,
      userModel,
      page,
      limit,
    });
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/withdrawals/pending')
  @ApiOperation({ summary: 'طلبات السحب المعلقة (Admin)' })
  async getPendingWithdrawals() {
    return this.walletService.getPendingWithdrawals();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch('admin/withdrawals/:id/approve')
  @ApiOperation({ summary: 'الموافقة على طلب سحب (Admin)' })
  @ApiParam({ name: 'id', description: 'معرّف طلب السحب' })
  async approveWithdrawal(
    @Param('id') withdrawalId: string,
    @Body() body: { transactionRef?: string; notes?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return await this.walletService.approveWithdrawal({
      withdrawalId,
      adminId,
      transactionRef: body.transactionRef,
      notes: body.notes,
    });
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch('admin/withdrawals/:id/reject')
  @ApiOperation({ summary: 'رفض طلب سحب (Admin)' })
  @ApiParam({ name: 'id', description: 'معرّف طلب السحب' })
  async rejectWithdrawal(
    @Param('id') withdrawalId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return await this.walletService.rejectWithdrawal({
      withdrawalId,
      adminId,
      reason: body.reason,
    });
  }

  // ==================== Coupons ====================
  // ✅ تم نقل إدارة الكوبونات إلى FinanceController - استخدم /finance/coupons

  // ==================== Subscriptions ====================
  // ✅ تم نقل الاشتراكات إلى ContentController - استخدم /content/subscription-plans

  // ==================== Pay Bills ====================

  @Auth(AuthType.JWT)
  @Post('pay-bill')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'دفع فاتورة (كهرباء، ماء، إنترنت)',
    description: 'دفع الفواتير من المحفظة',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        billType: {
          type: 'string',
          enum: ['electricity', 'water', 'internet'],
        },
        billNumber: { type: 'string' },
        amount: { type: 'number' },
      },
      required: ['billType', 'billNumber', 'amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم دفع الفاتورة بنجاح' })
  @ApiResponse({
    status: 400,
    description: 'رصيد غير كافٍ أو بيانات غير صالحة',
  })
  async payBill(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      billType: string;
      billNumber: string;
      amount: number;
    },
  ) {
    return this.walletService.payBill(
      userId,
      body.billType,
      body.billNumber,
      body.amount,
    );
  }

  @Auth(AuthType.JWT)
  @Get('bills')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'سجل الفواتير المدفوعة',
    description: 'الحصول على سجل جميع الفواتير المدفوعة',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'سجل الفواتير' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getBills(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getBills(userId, pagination);
  }

  // ==================== Transfers ====================

  @Auth(AuthType.JWT)
  @Throttle({ strict: { ttl: 60000, limit: 5 } }) // ✅ 5 تحويلات كحد أقصى في الدقيقة
  @Post('transfer')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحويل رصيد' })
  async transferFunds(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      recipientPhone: string;
      amount: number;
      notes?: string;
    },
  ) {
    return this.walletService.transferFunds(
      userId,
      body.recipientPhone,
      body.amount,
      body.notes,
    );
  }

  @Auth(AuthType.JWT)
  @Get('transfers')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل التحويلات' })
  async getTransfers(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTransfers(userId, pagination);
  }

  // ==================== Additional ====================

  @Auth(AuthType.JWT)
  @Get('transaction/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفاصيل معاملة' })
  async getTransactionDetails(
    @Param('id') transactionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletService.getTransactionDetails(transactionId, userId);
  }

  @Auth(AuthType.JWT)
  @Post('refund/request')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب استرجاع' })
  async requestRefund(
    @CurrentUser('id') userId: string,
    @Body() body: { transactionId: string; reason: string },
  ) {
    return this.walletService.requestRefund(
      userId,
      body.transactionId,
      body.reason,
    );
  }

  // ==================== Admin Management ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/users')
  @ApiOperation({
    summary: 'جلب جميع المستخدمين مع محافظهم (Admin)',
    description: 'جلب قائمة بجميع المستخدمين مع معلومات محافظهم مع إمكانية الفلترة',
  })
  @ApiResponse({ status: 200, description: 'قائمة المستخدمين مع محافظهم' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async getWalletUsers(@Query() filters: WalletUsersFilterDto) {
    return this.walletService.getWalletUsers(filters);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/stats')
  @ApiOperation({
    summary: 'إحصائيات المحفظة الشاملة (Admin)',
    description: 'جلب إحصائيات شاملة عن المحفظة (المستخدمين، الأرصدة، المعاملات)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['today', 'week', 'month', 'year', 'all'],
    description: 'الفترة الزمنية للإحصائيات',
  })
  @ApiResponse({ status: 200, description: 'إحصائيات المحفظة' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async getWalletStats(@Query('period') period?: string) {
    return this.walletService.getWalletStats(period);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/transactions')
  @ApiOperation({
    summary: 'جلب جميع المعاملات مع فلترة (Admin)',
    description: 'جلب جميع المعاملات مع إمكانية الفلترة المتقدمة',
  })
  @ApiResponse({ status: 200, description: 'قائمة المعاملات' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async getAllTransactions(@Query() filters: TransactionFilterDto) {
    return this.walletService.getAllTransactions(filters);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('admin/user/:id')
  @ApiOperation({
    summary: 'جلب محفظة مستخدم محدد (Admin)',
    description: 'جلب معلومات محفظة مستخدم محدد مع آخر المعاملات',
  })
  @ApiParam({ name: 'id', description: 'معرف المستخدم' })
  @ApiResponse({ status: 200, description: 'معلومات المحفظة' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية' })
  async getUserWalletForAdmin(@Param('id') userId: string) {
    return this.walletService.getUserWalletForAdmin(userId);
  }
}
