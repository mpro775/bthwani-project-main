import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WithdrawalRequest } from '../../finance/entities/withdrawal-request.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { Vendor } from '../../vendor/entities/vendor.entity';
import {
  Wallet,
  DriverWithWallet,
  VendorWithWallet,
} from '../interfaces/admin.interfaces';
import * as DTO from '../dto';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(WithdrawalRequest.name)
    private withdrawalModel: Model<WithdrawalRequest>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
  ) {}

  async getWithdrawals(
    query?: DTO.GetWithdrawalsQueryDto,
  ): Promise<DTO.GetWithdrawalsResponseDto> {
    const matchQuery: Record<string, any> = {};

    if (query?.status) {
      matchQuery.status = query.status;
    }

    if (query?.userModel) {
      matchQuery.userModel = query.userModel;
    }

    const page = query?.page || 1;
    const limit = Math.min(query?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      this.withdrawalModel
        .find(matchQuery)
        .populate('userId', 'fullName phone email')
        .populate('approvedBy', 'fullName')
        .populate('rejectedBy', 'fullName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.withdrawalModel.countDocuments(matchQuery),
    ]);

    return {
      data: withdrawals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPendingWithdrawals(): Promise<DTO.GetPendingWithdrawalsResponseDto> {
    const withdrawals = await this.withdrawalModel
      .find({ status: 'pending' })
      .populate('userId', 'fullName phone email')
      .sort({ createdAt: 1 }) // FIFO - First In First Out
      .limit(100);

    return {
      data: withdrawals,
      total: withdrawals.length,
    };
  }

  async approveWithdrawal(
    data: DTO.ApproveWithdrawalDto,
  ): Promise<DTO.ApproveWithdrawalResponseDto> {
    // Find withdrawal request
    const withdrawal = await this.withdrawalModel.findById(data.withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException({
        code: 'WITHDRAWAL_NOT_FOUND',
        userMessage: 'طلب السحب غير موجود',
      });
    }

    // Check if already processed
    if (withdrawal.status !== 'pending') {
      throw new BadRequestException({
        code: 'WITHDRAWAL_ALREADY_PROCESSED',
        userMessage: 'تم معالجة طلب السحب بالفعل',
      });
    }

    // Get user and check balance based on model type
    let user: DriverWithWallet | VendorWithWallet | null;
    let wallet: Wallet;

    if (withdrawal.userModel === 'Driver') {
      const driver = await this.driverModel.findById(withdrawal.userId);
      if (!driver) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          userMessage: 'المستخدم غير موجود',
        });
      }
      user = driver as unknown as DriverWithWallet;
      wallet = user.wallet || { balance: 0, totalWithdrawn: 0 };
    } else if (withdrawal.userModel === 'Vendor') {
      const vendor = await this.vendorModel.findById(withdrawal.userId);
      if (!vendor) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          userMessage: 'المستخدم غير موجود',
        });
      }
      user = vendor as unknown as VendorWithWallet;
      wallet = user.wallet || { balance: 0, totalWithdrawn: 0 };
    } else {
      throw new BadRequestException({
        code: 'INVALID_USER_MODEL',
        userMessage: 'نوع المستخدم غير صحيح',
      });
    }

    // Verify sufficient balance
    if (wallet.balance < withdrawal.amount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        userMessage: 'الرصيد غير كافٍ',
      });
    }

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approvedBy = new Types.ObjectId(data.adminId);
    withdrawal.approvedAt = new Date();
    withdrawal.transactionRef = data.transactionRef;
    withdrawal.notes = data.notes;

    // Update user balance
    wallet.balance -= withdrawal.amount;
    wallet.totalWithdrawn = (wallet.totalWithdrawn || 0) + withdrawal.amount;
    user.wallet = wallet;

    // Save both in parallel
    if (withdrawal.userModel === 'Driver') {
      await Promise.all([
        withdrawal.save(),
        this.driverModel.findByIdAndUpdate(user._id, { wallet }),
      ]);
    } else {
      await Promise.all([
        withdrawal.save(),
        this.vendorModel.findByIdAndUpdate(user._id, { wallet }),
      ]);
    }

    // TODO: Send notification to user
    // TODO: Log audit trail

    return {
      success: true,
      message: 'تم الموافقة على طلب السحب',
      withdrawal,
    };
  }

  async rejectWithdrawal(
    data: DTO.RejectWithdrawalDto,
  ): Promise<DTO.RejectWithdrawalResponseDto> {
    // Find withdrawal request
    const withdrawal = await this.withdrawalModel.findById(data.withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException({
        code: 'WITHDRAWAL_NOT_FOUND',
        userMessage: 'طلب السحب غير موجود',
      });
    }

    // Check if already processed
    if (withdrawal.status !== 'pending') {
      throw new BadRequestException({
        code: 'WITHDRAWAL_ALREADY_PROCESSED',
        userMessage: 'تم معالجة طلب السحب بالفعل',
      });
    }

    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.rejectedBy = new Types.ObjectId(data.adminId);
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = data.reason;

    await withdrawal.save();

    // TODO: Send notification to user
    // TODO: Log audit trail

    return {
      success: true,
      message: 'تم رفض طلب السحب',
    };
  }
}
