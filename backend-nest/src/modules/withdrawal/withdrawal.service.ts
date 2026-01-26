import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Withdrawal } from './entities/withdrawal.entity';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WalletService } from '../wallet/wallet.service';

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  WALLET_TRANSFER = 'wallet_transfer',
  CRYPTO = 'crypto',
}

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<Withdrawal>,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
  ) {}

  async createWithdrawal(dto: CreateWithdrawalDto) {
    // Validate user has sufficient balance
    const walletBalance = await this.walletService.getWalletBalance(dto.userId);
    if (walletBalance.availableBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create withdrawal record
    const withdrawal = await this.withdrawalModel.create({
      ...dto,
      status: WithdrawalStatus.PENDING,
    });

    // Hold the funds
    await this.walletService.holdFunds(dto.userId, dto.amount, `withdrawal-${withdrawal._id}`);

    return withdrawal;
  }

  async approveWithdrawal(data: {
    withdrawalId: string;
    adminId: string;
    transactionRef?: string;
    notes?: string;
  }) {
    const withdrawal = await this.withdrawalModel.findById(data.withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal is not in pending status');
    }

    // Update withdrawal
    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.approvedBy = new Types.ObjectId(data.adminId);
    withdrawal.approvedAt = new Date();
    withdrawal.transactionRef = data.transactionRef;
    withdrawal.notes = data.notes;

    await withdrawal.save();

    // Process the withdrawal (release funds and transfer)
    await this.processApprovedWithdrawal(withdrawal);

    return withdrawal;
  }

  async rejectWithdrawal(data: {
    withdrawalId: string;
    adminId: string;
    reason: string;
  }) {
    const withdrawal = await this.withdrawalModel.findById(data.withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal is not in pending status');
    }

    // Update withdrawal
    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectedBy = new Types.ObjectId(data.adminId);
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = data.reason;

    await withdrawal.save();

    // Release the held funds
    await this.walletService.releaseFunds(
      withdrawal.userId.toString(),
      withdrawal.amount,
      `withdrawal-${withdrawal._id}-refund`
    );

    return withdrawal;
  }

  async getWithdrawals(query?: any) {
    const { status, userModel, page = 1, limit = 20 } = query || {};

    const filter: any = {};
    if (status) filter.status = status;
    if (userModel) filter.userModel = userModel;

    const withdrawals = await this.withdrawalModel
      .find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.withdrawalModel.countDocuments(filter);

    return {
      data: withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingWithdrawals() {
    return this.withdrawalModel
      .find({ status: WithdrawalStatus.PENDING })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  private async processApprovedWithdrawal(withdrawal: any) {
    try {
      // Transfer funds based on method
      switch (withdrawal.method) {
        case WithdrawalMethod.BANK_TRANSFER:
          await this.processBankTransfer(withdrawal);
          break;
        case WithdrawalMethod.WALLET_TRANSFER:
          await this.processWalletTransfer(withdrawal);
          break;
        case WithdrawalMethod.CRYPTO:
          await this.processCryptoTransfer(withdrawal);
          break;
        default:
          throw new Error(`Unsupported withdrawal method: ${withdrawal.method}`);
      }

      // Update status to completed
      withdrawal.status = WithdrawalStatus.COMPLETED;
      withdrawal.completedAt = new Date();
      await withdrawal.save();

    } catch (error) {
      // Mark as failed
      withdrawal.status = WithdrawalStatus.FAILED;
      withdrawal.failureReason = error.message;
      await withdrawal.save();

      // Log error for manual processing
      console.error(`Withdrawal processing failed for ${withdrawal._id}:`, error);
    }
  }

  private async processBankTransfer(withdrawal: any) {
    // Implement bank transfer logic
    // This would integrate with payment provider or banking API
    console.log(`Processing bank transfer for withdrawal ${withdrawal._id}`);
  }

  private async processWalletTransfer(withdrawal: any) {
    // Transfer to another wallet
    console.log(`Processing wallet transfer for withdrawal ${withdrawal._id}`);
  }

  private async processCryptoTransfer(withdrawal: any) {
    // Transfer to crypto wallet
    console.log(`Processing crypto transfer for withdrawal ${withdrawal._id}`);
  }

  async getWithdrawalById(id: string) {
    const withdrawal = await this.withdrawalModel.findById(id);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }
    return withdrawal;
  }
}
