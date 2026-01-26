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
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WalletService } from './wallet.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';

/**
 * V2 Wallet Controller - Specific endpoints for v2 API
 * This controller handles wallet-related operations that are specific to v2
 */
@ApiTags('Wallet V2')
@ApiBearerAuth()
@Controller({ path: 'v2/wallet', version: '2' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class V2WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ==================== Balance ====================

  @Auth(AuthType.FIREBASE)
  @Get('balance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب رصيد المحفظة',
    description: 'الحصول على الرصيد الحالي والرصيد المحجوز',
  })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getWalletBalance(userId);
  }

  // ==================== Transactions ====================

  @Auth(AuthType.FIREBASE)
  @Get('transactions')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب سجل المعاملات',
    description: 'الحصول على جميع معاملات المحفظة مع pagination',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTransactions(userId, pagination);
  }

  @Auth(AuthType.FIREBASE)
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

  // ==================== Topup ====================

  @Auth(AuthType.FIREBASE)
  @Get('topup/methods')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طرق الشحن المتاحة',
    description: 'الحصول على قائمة طرق الشحن المدعومة',
  })
  async getTopupMethods() {
    return this.walletService.getTopupMethods();
  }

  @Auth(AuthType.FIREBASE)
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

  @Auth(AuthType.FIREBASE)
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
  async verifyTopup(
    @CurrentUser('id') userId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.walletService.verifyTopup(userId, body.transactionId);
  }

  @Auth(AuthType.FIREBASE)
  @Get('topup/history')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'سجل عمليات الشحن',
    description: 'الحصول على سجل جميع عمليات الشحن السابقة',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTopupHistory(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTopupHistory(userId, pagination);
  }

  // ==================== Withdrawals ====================

  @Auth(AuthType.FIREBASE)
  @Get('withdraw/methods')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طرق السحب المتاحة',
    description: 'الحصول على قائمة طرق السحب المدعومة',
  })
  async getWithdrawMethods() {
    return this.walletService.getWithdrawMethods();
  }

  @Auth(AuthType.FIREBASE)
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
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

  @Auth(AuthType.FIREBASE)
  @Get('withdraw/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'طلبات السحب الخاصة بي',
    description: 'الحصول على قائمة طلبات السحب مع حالاتها',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyWithdrawals(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getMyWithdrawals(userId, pagination);
  }

  @Auth(AuthType.FIREBASE)
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
  async cancelWithdrawal(
    @Param('id') withdrawalId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletService.cancelWithdrawal(withdrawalId, userId);
  }

  // ==================== Coupons ====================

  @Auth(AuthType.FIREBASE)
  @Post('coupons/apply')
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coupon' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تطبيق قسيمة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'رمز القسيمة' },
        amount: { type: 'number', description: 'المبلغ (اختياري)' },
      },
      required: ['code'],
    },
  })
  async applyCoupon(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string; amount?: number },
  ) {
    return this.walletService.applyCoupon(userId, body.code, body.amount);
  }

  @Auth(AuthType.FIREBASE)
  @Post('coupons/validate')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Invalid coupon' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'التحقق من صلاحية قسيمة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'رمز القسيمة' },
        amount: { type: 'number', description: 'المبلغ (اختياري)' },
      },
      required: ['code'],
    },
  })
  async validateCoupon(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string; amount?: number },
  ) {
    return this.walletService.validateCoupon(userId, body.code, body.amount);
  }

  @Auth(AuthType.FIREBASE)
  @Get('coupons/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'قسائمي' })
  async getMyCoupons(@CurrentUser('id') userId: string) {
    return this.walletService.getMyCoupons(userId);
  }

  @Auth(AuthType.FIREBASE)
  @Get('coupons/history')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل القسائم' })
  async getCouponsHistory(@CurrentUser('id') userId: string) {
    return this.walletService.getCouponsHistory(userId);
  }

  // ==================== Subscriptions ====================

  @Auth(AuthType.FIREBASE)
  @Post('subscriptions/subscribe')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الاشتراك في خدمة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planId: { type: 'string', description: 'معرف الخطة' },
        autoRenew: { type: 'boolean', description: 'تجديد تلقائي' },
      },
      required: ['planId'],
    },
  })
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() body: { planId: string; autoRenew?: boolean },
  ) {
    return this.walletService.subscribe(userId, body.planId, body.autoRenew);
  }

  @Auth(AuthType.FIREBASE)
  @Get('subscriptions/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'اشتراكاتي' })
  async getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.walletService.getMySubscriptions(userId);
  }

  @Auth(AuthType.FIREBASE)
  @Patch('subscriptions/:id/cancel')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إلغاء اشتراك' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'سبب الإلغاء (اختياري)' },
      },
    },
    required: false,
  })
  async cancelSubscription(
    @Param('id') subscriptionId: string,
    @CurrentUser('id') userId: string,
    @Body() body?: { reason?: string },
  ) {
    return this.walletService.cancelSubscription(userId, subscriptionId, body?.reason);
  }

  // ==================== Bills ====================

  @Auth(AuthType.FIREBASE)
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

  @Auth(AuthType.FIREBASE)
  @Get('bills')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'سجل الفواتير المدفوعة',
    description: 'الحصول على سجل جميع الفواتير المدفوعة',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBills(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getBills(userId, pagination);
  }

  // ==================== Transfers ====================

  @Auth(AuthType.FIREBASE)
  @Throttle({ strict: { ttl: 60000, limit: 5 } })
  @Post('transfer')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحويل رصيد' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientPhone: { type: 'string', description: 'رقم هاتف المستلم' },
        amount: { type: 'number', description: 'المبلغ' },
        notes: { type: 'string', description: 'ملاحظات' },
      },
      required: ['recipientPhone', 'amount'],
    },
  })
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

  @Auth(AuthType.FIREBASE)
  @Get('transfers')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل التحويلات' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransfers(
    @CurrentUser('id') userId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.walletService.getTransfers(userId, pagination);
  }

  // ==================== Refunds ====================

  @Auth(AuthType.FIREBASE)
  @Post('refund/request')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب استرجاع' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', description: 'معرّف المعاملة' },
        reason: { type: 'string', description: 'سبب الاسترجاع' },
      },
      required: ['transactionId', 'reason'],
    },
  })
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
}

