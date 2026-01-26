import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { User } from '../auth/entities/user.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { WalletUsersFilterDto } from './dto/wallet-users-filter.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import {
  TransactionHelper,
  WalletHelper,
  PaginationHelper,
} from '../../common/utils';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { CouponService } from '../finance/services/coupon.service';
import { ContentService } from '../content/services/content.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => WithdrawalService))
    private withdrawalService: WithdrawalService,
    @Inject(forwardRef(() => CouponService))
    private couponService: CouponService,
    @Inject(forwardRef(() => ContentService))
    private contentService: ContentService,
  ) {}

  // جلب رصيد المحفظة
  async getWalletBalance(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
        suggestedAction: 'يرجى التحقق من المعرف',
      });
    }

    return {
      userId: user._id,
      balance: user.wallet.balance,
      onHold: user.wallet.onHold,
      availableBalance: user.wallet.balance - user.wallet.onHold,
      totalSpent: user.wallet.totalSpent,
      totalEarned: user.wallet.totalEarned,
      loyaltyPoints: user.wallet.loyaltyPoints,
      savings: user.wallet.savings,
      currency: user.wallet.currency,
      lastUpdated: user.wallet.lastUpdated,
    };
  }

  // إنشاء معاملة جديدة (مع Transaction)
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        const user = await this.userModel
          .findById(createTransactionDto.userId)
          .session(session);

        if (!user) {
          throw new NotFoundException({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            userMessage: 'المستخدم غير موجود',
          });
        }

        // التحقق من الرصيد في حالة الخصم
        if (createTransactionDto.type === 'debit') {
          WalletHelper.validateBalance(
            user.wallet.balance,
            user.wallet.onHold,
            createTransactionDto.amount,
          );
        }

        // إنشاء المعاملة
        const [transaction] = await this.walletTransactionModel.create(
          [
            {
              ...createTransactionDto,
              userId: new Types.ObjectId(createTransactionDto.userId),
            },
          ],
          { session },
        );

        // تحديث رصيد المحفظة
        await this.updateUserWalletBalance(
          createTransactionDto.userId,
          createTransactionDto.amount,
          createTransactionDto.type as 'credit' | 'debit',
          session,
        );

        return transaction;
      },
    );
  }

  // تحديث رصيد المحفظة
  private async updateUserWalletBalance(
    userId: string,
    amount: number,
    type: 'credit' | 'debit',
    session?: ClientSession,
  ) {
    const updateQuery = WalletHelper.createWalletUpdate(amount, type);

    await this.userModel.findByIdAndUpdate(userId, updateQuery, {
      new: true,
      session,
    });
  }

  // جلب سجل المعاملات مع Cursor Pagination
  async getTransactions(userId: string, pagination: CursorPaginationDto) {
    return PaginationHelper.paginate(
      this.walletTransactionModel,
      { userId: new Types.ObjectId(userId) },
      pagination,
    );
  }

  // حجز مبلغ (Escrow) - مع Transaction
  async holdFunds(userId: string, amount: number, orderId?: string) {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        const user = await this.userModel.findById(userId).session(session);

        if (!user) {
          throw new NotFoundException({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            userMessage: 'المستخدم غير موجود',
          });
        }

        // التحقق من الرصيد
        WalletHelper.validateBalance(
          user.wallet.balance,
          user.wallet.onHold,
          amount,
        );

        // تحديث المبلغ المحجوز
        const holdUpdate = WalletHelper.createHoldUpdate(amount);
        await this.userModel.findByIdAndUpdate(userId, holdUpdate, {
          new: true,
          session,
        });

        // إنشاء معاملة حجز
        const [transaction] = await this.walletTransactionModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              userModel: 'User',
              amount,
              type: 'debit',
              method: 'escrow',
              status: 'pending',
              description: 'حجز مبلغ للطلب',
              meta: orderId ? { orderId } : {},
            },
          ],
          { session },
        );

        return transaction;
      },
    );
  }

  // إطلاق المبلغ المحجوز - مع Transaction
  async releaseFunds(userId: string, amount: number, orderId?: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          userMessage: 'المستخدم غير موجود',
        });
      }

      // تحديث المبلغ المحجوز والرصيد
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            'wallet.onHold': -amount,
            'wallet.balance': -amount,
            'wallet.totalSpent': amount,
          },
          'wallet.lastUpdated': new Date(),
        },
        { new: true, session },
      );

      // تحديث حالة المعاملة
      await this.walletTransactionModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          method: 'escrow',
          status: 'pending',
          'meta.orderId': orderId,
        },
        { status: 'completed' },
        { session },
      );

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      void session.endSession();
    }
  }

  // إرجاع المبلغ المحجوز - مع Transaction
  async refundHeldFunds(userId: string, amount: number, orderId?: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          userMessage: 'المستخدم غير موجود',
        });
      }

      // إلغاء الحجز فقط
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $inc: { 'wallet.onHold': -amount },
          'wallet.lastUpdated': new Date(),
        },
        { new: true, session },
      );

      // تحديث حالة المعاملة
      await this.walletTransactionModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          method: 'escrow',
          status: 'pending',
          'meta.orderId': orderId,
        },
        { status: 'reversed' },
        { session },
      );

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      void session.endSession();
    }
  }

  // ==================== Topup (Kuraimi) ====================

  async topupViaKuraimi(
    userId: string,
    amount: number,
    SCustID: string,
    _PINPASS: string,
  ) {
    void _PINPASS; // TODO: Integrate with Kuraimi API
    // const paymentResult = await sendPaymentToKuraimi({ amount, SCustID, PINPASS });

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findById(userId).session(session);
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          userMessage: 'المستخدم غير موجود',
        });
      }

      // Simulate success for now
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            'wallet.balance': amount,
            'wallet.totalEarned': amount,
          },
          'wallet.lastUpdated': new Date(),
        },
        { new: true, session },
      );

      // Create transaction
      const [transaction] = await this.walletTransactionModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            userModel: 'User',
            amount,
            type: 'credit',
            method: 'kuraimi',
            status: 'completed',
            description: 'شحن المحفظة عبر كريمي',
            meta: { SCustID },
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return {
        success: true,
        transaction,
        newBalance: user.wallet.balance + amount,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      void session.endSession();
    }
  }

  async verifyTopup(userId: string, transactionId: string) {
    const transaction =
      await this.walletTransactionModel.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException({
        code: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        userMessage: 'المعاملة غير موجودة',
      });
    }

    return { verified: transaction.status === 'completed', transaction };
  }

  async getTopupHistory(userId: string, pagination: CursorPaginationDto) {
    return PaginationHelper.paginate(
      this.walletTransactionModel,
      {
        userId: new Types.ObjectId(userId),
        type: 'credit',
        method: { $in: ['kuraimi', 'card', 'bank'] },
      },
      pagination,
    );
  }

  async getTopupMethods() {
    await Promise.resolve();
    return {
      methods: [
        { id: 'kuraimi', name: 'كريمي', enabled: true },
        { id: 'card', name: 'بطاقة بنكية', enabled: false },
        { id: 'bank', name: 'تحويل بنكي', enabled: false },
      ],
    };
  }

  // ==================== Withdrawals ====================

  async requestWithdrawal(
    userId: string,
    amount: number,
    _method: string,
    _accountInfo: Record<string, unknown>,
  ) {
    void _method;
    void _accountInfo;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    const availableBalance = user.wallet.balance - user.wallet.onHold;

    if (availableBalance < amount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient balance',
        userMessage: 'الرصيد غير كافٍ',
        details: { available: availableBalance, required: amount },
      });
    }

    // TODO: Create WithdrawalRequest model and record

    return {
      success: true,
      message: 'تم تقديم طلب السحب',
      requestId: 'withdrawal_' + Date.now(),
    };
  }

  async getMyWithdrawals(_userId: string, _pagination: CursorPaginationDto) {
    void _userId;
    void _pagination; // TODO: Implement WithdrawalRequest model
    await Promise.resolve();
    return {
      data: [],
      pagination: { nextCursor: null, hasMore: false, limit: 20 },
    };
  }

  async cancelWithdrawal(_withdrawalId: string, _userId: string) {
    void _withdrawalId;
    void _userId; // TODO: Implement
    await Promise.resolve();
    return { success: true, message: 'تم إلغاء طلب السحب' };
  }

  async getWithdrawMethods() {
    await Promise.resolve();
    return {
      methods: [
        {
          id: 'bank_transfer',
          name: 'تحويل بنكي',
          minAmount: 100,
          maxAmount: 10000,
        },
        { id: 'kuraimi', name: 'كريمي', minAmount: 50, maxAmount: 5000 },
        { id: 'cash', name: 'نقداً', minAmount: 100, maxAmount: 2000 },
      ],
    };
  }

  // ==================== Coupons ====================

  async applyCoupon(_userId: string, _code: string, _amount?: number) {
    void _userId;
    void _code;
    void _amount; // TODO: Implement Coupon model and validation
    await Promise.resolve();
    return { success: true, discount: 0, message: 'الكوبون غير صالح' };
  }

  async validateCoupon(_userId: string, _code: string) {
    void _userId;
    void _code; // TODO: Implement
    await Promise.resolve();
    return { valid: false, discount: 0 };
  }

  async getMyCoupons(_userId: string) {
    void _userId; // TODO: Implement
    await Promise.resolve();
    return { data: [] };
  }

  async getCouponHistory(_userId: string, _pagination: CursorPaginationDto) {
    void _userId;
    void _pagination; // TODO: Implement
    await Promise.resolve();
    return {
      data: [],
      pagination: { nextCursor: null, hasMore: false, limit: 20 },
    };
  }

  // ==================== Subscriptions ====================

  async subscribe(_userId: string, _planId: string, _autoRenew?: boolean) {
    void _userId;
    void _planId;
    void _autoRenew; // TODO: Implement Subscription model
    await Promise.resolve();
    return {
      success: true,
      message: 'تم الاشتراك بنجاح',
      subscriptionId: 'sub_' + Date.now(),
    };
  }

  async getMySubscriptions(_userId: string) {
    void _userId; // TODO: Implement
    await Promise.resolve();
    return { data: [] };
  }

  async cancelSubscription(_subscriptionId: string, _userId: string) {
    void _subscriptionId;
    void _userId; // TODO: Implement
    await Promise.resolve();
    return { success: true, message: 'تم إلغاء الاشتراك' };
  }

  // ==================== Pay Bills ====================

  async payBill(
    userId: string,
    billType: string,
    billNumber: string,
    amount: number,
  ) {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        const user = await this.userModel.findById(userId).session(session);

        if (!user) {
          throw new NotFoundException({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            userMessage: 'المستخدم غير موجود',
          });
        }

        // التحقق من الرصيد
        WalletHelper.validateBalance(
          user.wallet.balance,
          user.wallet.onHold,
          amount,
        );

        // خصم المبلغ
        const debitUpdate = WalletHelper.createDebitUpdate(amount);
        await this.userModel.findByIdAndUpdate(userId, debitUpdate, {
          new: true,
          session,
        });

        // إنشاء المعاملة
        const [transaction] = await this.walletTransactionModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              userModel: 'User',
              amount,
              type: 'debit',
              method: 'bill_payment',
              status: 'completed',
              description: `دفع فاتورة ${billType}`,
              meta: { billType, billNumber },
            },
          ],
          { session },
        );

        return {
          success: true,
          transaction,
          newBalance: user.wallet.balance - amount,
        };
      },
    );
  }

  async getBills(userId: string, pagination: CursorPaginationDto) {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      method: 'bill_payment',
    };

    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.walletTransactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  // ==================== Transfers ====================

  async transferFunds(
    userId: string,
    recipientPhone: string,
    amount: number,
    notes?: string,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const sender = await this.userModel.findById(userId).session(session);

      if (!sender) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          userMessage: 'المستخدم غير موجود',
        });
      }

      const recipient = await this.userModel
        .findOne({ phone: recipientPhone })
        .session(session);

      if (!recipient) {
        throw new NotFoundException({
          code: 'RECIPIENT_NOT_FOUND',
          message: 'Recipient not found',
          userMessage: 'المستلم غير موجود',
        });
      }

      const availableBalance = sender.wallet.balance - sender.wallet.onHold;

      if (availableBalance < amount) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance',
          userMessage: 'الرصيد غير كافٍ',
          details: { available: availableBalance, required: amount },
        });
      }

      // Deduct from sender
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            'wallet.balance': -amount,
            'wallet.totalSpent': amount,
          },
          'wallet.lastUpdated': new Date(),
        },
        { new: true, session },
      );

      // Add to recipient
      await this.userModel.findByIdAndUpdate(
        recipient._id,
        {
          $inc: {
            'wallet.balance': amount,
            'wallet.totalEarned': amount,
          },
          'wallet.lastUpdated': new Date(),
        },
        { new: true, session },
      );

      // Create transactions
      await this.walletTransactionModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            userModel: 'User',
            amount,
            type: 'debit',
            method: 'transfer',
            status: 'completed',
            description: `تحويل إلى ${recipient.fullName}`,
            meta: { recipientId: recipient._id, notes },
          },
          {
            userId: recipient._id,
            userModel: 'User',
            amount,
            type: 'credit',
            method: 'transfer',
            status: 'completed',
            description: `تحويل من ${sender.fullName}`,
            meta: { senderId: sender._id, notes },
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return { success: true, message: 'تم التحويل بنجاح' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      void session.endSession();
    }
  }

  async getTransfers(userId: string, pagination: CursorPaginationDto) {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      method: 'transfer',
    };

    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.walletTransactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  // ==================== Additional ====================

  async getTransactionDetails(transactionId: string, userId: string) {
    const transaction = await this.walletTransactionModel.findOne({
      _id: transactionId,
      userId: new Types.ObjectId(userId),
    });

    if (!transaction) {
      throw new NotFoundException({
        code: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        userMessage: 'المعاملة غير موجودة',
      });
    }

    return { transaction };
  }

  async requestRefund(
    _userId: string,
    _transactionId: string,
    _reason: string,
  ) {
    void _userId;
    void _transactionId;
    void _reason; // TODO: Implement refund request logic
    await Promise.resolve();
    return { success: true, message: 'تم تقديم طلب الاسترجاع' };
  }

  // ==================== Admin Withdrawal Management ====================

  async getAllWithdrawals(query?: any) {
    return this.withdrawalService.getWithdrawals(query);
  }

  async getPendingWithdrawals() {
    return this.withdrawalService.getPendingWithdrawals();
  }

  async approveWithdrawal(data: any): Promise<any> {
    return this.withdrawalService.approveWithdrawal(data);
  }

  async rejectWithdrawal(data: any): Promise<any> {
    return this.withdrawalService.rejectWithdrawal(data);
  }

  // ==================== Admin Management ====================

  /**
   * جلب جميع المستخدمين مع محافظهم (للإدارة)
   */
  async getWalletUsers(filters: WalletUsersFilterDto) {
    const query: any = {};

    // البحث في الاسم، البريد الإلكتروني، أو رقم الهاتف
    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // فلترة حسب الرصيد
    if (filters.minBalance !== undefined || filters.maxBalance !== undefined) {
      query['wallet.balance'] = {};
      if (filters.minBalance !== undefined) {
        query['wallet.balance'].$gte = filters.minBalance;
      }
      if (filters.maxBalance !== undefined) {
        query['wallet.balance'].$lte = filters.maxBalance;
      }
    }

    // فلترة حسب الرصيد المحجوز
    if (filters.minOnHold !== undefined || filters.maxOnHold !== undefined) {
      query['wallet.onHold'] = query['wallet.onHold'] || {};
      if (filters.minOnHold !== undefined) {
        query['wallet.onHold'].$gte = filters.minOnHold;
      }
      if (filters.maxOnHold !== undefined) {
        query['wallet.onHold'].$lte = filters.maxOnHold;
      }
    }

    // تحديد الحقول المطلوبة
    const selectFields =
      'fullName email phone profileImage wallet createdAt updatedAt';

    // استخدام offset pagination للـ admin panel
    const result = await PaginationHelper.paginateOffset(
      this.userModel,
      query,
      filters.page || 1,
      filters.limit || 20,
      {
        sortBy: this.mapSortBy(filters.sortBy),
        sortOrder: filters.sortOrder || 'desc',
        select: selectFields,
      },
    );

    // تنسيق البيانات للعرض
    const formattedData = result.data.map((user: any) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      wallet: {
        balance: user.wallet?.balance || 0,
        onHold: user.wallet?.onHold || 0,
        available: (user.wallet?.balance || 0) - (user.wallet?.onHold || 0),
        totalSpent: user.wallet?.totalSpent || 0,
        totalEarned: user.wallet?.totalEarned || 0,
        loyaltyPoints: user.wallet?.loyaltyPoints || 0,
        savings: user.wallet?.savings || 0,
        currency: user.wallet?.currency || 'YER',
        lastUpdated: user.wallet?.lastUpdated || user.createdAt,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      data: formattedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * إحصائيات شاملة للمحفظة (للإدارة)
   */
  async getWalletStats(period?: string) {
    const now = new Date();
    let startDate: Date;
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // تحديد فترة الإحصائيات
    switch (period) {
      case 'today':
        startDate = new Date(todayStart);
        break;
      case 'week':
        startDate = new Date(new Date().setDate(new Date().getDate() - 7));
        break;
      case 'month':
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // جميع البيانات
    }

    // إحصائيات المستخدمين
    const [
      totalUsers,
      usersWithWallet,
      totalBalance,
      totalOnHold,
      totalTransactions,
      transactionsToday,
    ] = await Promise.all([
      // إجمالي المستخدمين
      this.userModel.countDocuments({}),
      // المستخدمين الذين لديهم محفظة (رصيد > 0 أو محجوز > 0)
      this.userModel.countDocuments({
        $or: [
          { 'wallet.balance': { $gt: 0 } },
          { 'wallet.onHold': { $gt: 0 } },
        ],
      }),
      // إجمالي الأرصدة
      this.userModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$wallet.balance' },
          },
        },
      ]),
      // إجمالي المبالغ المحجوزة
      this.userModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$wallet.onHold' },
          },
        },
      ]),
      // إجمالي المعاملات
      this.walletTransactionModel.countDocuments({}),
      // المعاملات اليوم
      this.walletTransactionModel.countDocuments({
        createdAt: { $gte: todayStart },
      }),
    ]);

    // إحصائيات المعاملات حسب الفترة
    const transactionsInPeriod = await this.walletTransactionModel.countDocuments(
      {
        createdAt: { $gte: startDate },
      },
    );

    // إجمالي المبالغ في المعاملات حسب الفترة
    const transactionsAmount = await this.walletTransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const credits = transactionsAmount.find((t) => t._id === 'credit')?.total || 0;
    const debits = transactionsAmount.find((t) => t._id === 'debit')?.total || 0;

    // متوسط الرصيد
    const avgBalanceResult = await this.userModel.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$wallet.balance' },
        },
      },
    ]);

    return {
      totalUsers,
      usersWithWallet,
      totalBalance: totalBalance[0]?.total || 0,
      totalOnHold: totalOnHold[0]?.total || 0,
      totalAvailable: (totalBalance[0]?.total || 0) - (totalOnHold[0]?.total || 0),
      totalTransactions,
      transactionsToday,
      transactionsInPeriod,
      creditsInPeriod: credits,
      debitsInPeriod: debits,
      netInPeriod: credits - debits,
      averageBalance: avgBalanceResult[0]?.avg || 0,
      period: period || 'all',
    };
  }

  /**
   * جلب جميع المعاملات مع فلترة متقدمة (للإدارة)
   */
  async getAllTransactions(filters: TransactionFilterDto) {
    const query: any = {};

    // فلترة حسب المستخدم
    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    // فلترة حسب نوع النموذج
    if (filters.userModel) {
      query.userModel = filters.userModel;
    }

    // فلترة حسب النوع
    if (filters.type) {
      query.type = filters.type;
    }

    // فلترة حسب الطريقة
    if (filters.method) {
      query.method = filters.method;
    }

    // فلترة حسب الحالة
    if (filters.status) {
      query.status = filters.status;
    }

    // فلترة حسب المبلغ
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) {
        query.amount.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.amount.$lte = filters.maxAmount;
      }
    }

    // فلترة حسب التاريخ
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // البحث في الوصف
    if (filters.search) {
      query.description = { $regex: filters.search, $options: 'i' };
    }

    // استخدام cursor pagination
    const pagination: CursorPaginationDto = {
      cursor: filters.cursor,
      limit: filters.limit || 20,
    };

    return PaginationHelper.paginate(
      this.walletTransactionModel,
      query,
      pagination,
      {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        populate: {
          path: 'userId',
          select: 'fullName email phone',
        },
      },
    );
  }

  /**
   * جلب محفظة مستخدم محدد (للإدارة)
   */
  async getUserWalletForAdmin(userId: string) {
    const user = await this.userModel.findById(userId).select(
      'fullName email phone profileImage wallet createdAt updatedAt',
    );

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // جلب آخر 10 معاملات
    const recentTransactions = await this.walletTransactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      wallet: {
        balance: user.wallet?.balance || 0,
        onHold: user.wallet?.onHold || 0,
        available: (user.wallet?.balance || 0) - (user.wallet?.onHold || 0),
        totalSpent: user.wallet?.totalSpent || 0,
        totalEarned: user.wallet?.totalEarned || 0,
        loyaltyPoints: user.wallet?.loyaltyPoints || 0,
        savings: user.wallet?.savings || 0,
        currency: user.wallet?.currency || 'YER',
        lastUpdated: user.wallet?.lastUpdated || user.createdAt,
      },
      recentTransactions,
    };
  }

  /**
   * تحويل sortBy من DTO إلى مسار في الـ schema
   */
  private mapSortBy(sortBy?: string): string {
    const mapping: Record<string, string> = {
      balance: 'wallet.balance',
      onHold: 'wallet.onHold',
      totalEarned: 'wallet.totalEarned',
      totalSpent: 'wallet.totalSpent',
      createdAt: 'createdAt',
    };

    return mapping[sortBy || 'createdAt'] || 'createdAt';
  }

  // ==================== Coupons ====================

  /**
   * تطبيق كوبون على المحفظة
   */
  async applyCoupon(userId: string, code: string, amount?: number) {
    // التحقق من صلاحية الكوبون
    const validation = await this.couponService.validate(
      {
        code,
        orderAmount: amount || 0,
      },
      userId,
    );

    if (!validation.valid) {
      throw new BadRequestException({
        code: 'INVALID_COUPON',
        message: validation.message,
        userMessage: validation.message,
      });
    }

    // تطبيق الكوبون (زيادة العداد)
    await this.couponService.apply(validation.couponId, userId);

    // إضافة المبلغ إلى المحفظة كإيداع
    if (validation.discountAmount && validation.discountAmount > 0) {
      await this.credit(
        userId,
        validation.discountAmount,
        'reward',
        `خصم من كوبون: ${code}`,
        {
          couponCode: code,
          couponId: validation.couponId,
        },
      );
    }

    return {
      success: true,
      message: 'تم تطبيق القسيمة بنجاح',
      discount: validation.discountAmount || 0,
      data: {
        code: validation.code,
        discount: validation.discountAmount || 0,
        appliedAt: new Date(),
      },
    };
  }

  /**
   * التحقق من صلاحية كوبون
   */
  async validateCoupon(userId: string, code: string, amount?: number) {
    const validation = await this.couponService.validate(
      {
        code,
        orderAmount: amount || 0,
      },
      userId,
    );

    return validation;
  }

  /**
   * الحصول على كوبونات المستخدم المتاحة
   */
  async getMyCoupons(userId: string) {
    // جلب جميع الكوبونات النشطة
    const coupons = await this.couponService.findAll(true);

    // فلترة الكوبونات المتاحة للمستخدم
    const availableCoupons = coupons.filter((coupon) => {
      const now = new Date();
      return (
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.endDate &&
        coupon.currentUsage < coupon.maxUsage
      );
    });

    return {
      success: true,
      data: availableCoupons,
      message: availableCoupons.length > 0 ? 'تم جلب القسائم بنجاح' : 'لا توجد قسائم متاحة حالياً',
    };
  }

  /**
   * الحصول على سجل استخدام الكوبونات
   */
  async getCouponsHistory(userId: string) {
    // البحث عن المعاملات المتعلقة بالكوبونات
    const transactions = await this.walletTransactionModel
      .find({
        userId,
        method: 'reward',
        'meta.couponCode': { $exists: true },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      data: transactions.map((t) => ({
        code: t.meta?.couponCode,
        discount: t.amount,
        appliedAt: t.createdAt,
        status: t.status,
      })),
      message: transactions.length > 0 ? 'تم جلب السجل بنجاح' : 'لا يوجد سجل قسائم',
    };
  }

  // ==================== Subscriptions ====================

  /**
   * الاشتراك في خطة
   */
  async subscribe(userId: string, planId: string, autoRenew?: boolean) {
    // جلب جميع الخطط للبحث عن الخطة
    const plans = await this.contentService.findAllSubscriptionPlans();
    const plan = plans.find((p) => p._id.toString() === planId);

    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Plan not found',
        userMessage: 'الخطة غير موجودة أو غير نشطة',
      });
    }

    // التحقق من الرصيد
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    if (user.wallet.balance < plan.price) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient balance',
        userMessage: 'الرصيد غير كافي',
      });
    }

    // خصم المبلغ من المحفظة
    await this.debit(
      userId,
      plan.price,
      'payment',
      `اشتراك في خطة: ${plan.name || plan.code}`,
      {
        planId: plan._id,
        planCode: plan.code,
      },
    );

    // إنشاء الاشتراك
    const subscription = await this.contentService.subscribe(userId, {
      planCode: plan.code,
      paymentMethod: 'wallet',
    });

    // تحديث autoRenew إذا تم تحديده
    if (autoRenew !== undefined) {
      subscription.autoRenew = autoRenew;
      await subscription.save();
    }

    return {
      success: true,
      message: 'تم الاشتراك بنجاح',
      subscription: {
        _id: subscription._id,
        plan: subscription.plan,
        amount: subscription.amountPaid,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
      },
    };
  }

  /**
   * الحصول على اشتراكات المستخدم
   */
  async getMySubscriptions(userId: string) {
    const subscription = await this.contentService.getMySubscription(userId);

    if (!subscription) {
      return {
        success: true,
        data: [],
        message: 'لا توجد اشتراكات نشطة',
      };
    }

    return {
      success: true,
      data: [subscription],
      message: 'تم جلب الاشتراكات بنجاح',
    };
  }

  /**
   * إلغاء اشتراك
   */
  async cancelSubscription(userId: string, subscriptionId: string, reason?: string) {
    // التحقق من أن الاشتراك يخص المستخدم
    const subscription = await this.contentService.getMySubscription(userId);

    if (!subscription || subscription._id.toString() !== subscriptionId) {
      throw new NotFoundException({
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'Subscription not found',
        userMessage: 'الاشتراك غير موجود',
      });
    }

    // إلغاء الاشتراك
    const cancelled = await this.contentService.cancelSubscription(
      userId,
      reason || 'إلغاء من المستخدم',
    );

    return {
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح',
      subscription: cancelled,
    };
  }
}
