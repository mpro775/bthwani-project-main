import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import { WalletEvent, WalletEventType } from '../entities/wallet-event.entity';
import { User } from '../../auth/entities/user.entity';
import {
  CreateWalletEventDto,
  WalletSnapshot,
  EventReplayResult,
} from '../interfaces/wallet-event.interface';

@Injectable()
export class WalletEventService {
  private readonly logger = new Logger(WalletEventService.name);

  constructor(
    @InjectModel(WalletEvent.name)
    private walletEventModel: Model<WalletEvent>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * إنشاء حدث جديد وحفظه في Event Store
   */
  async createEvent(
    dto: CreateWalletEventDto,
    session?: ClientSession,
  ): Promise<WalletEvent> {
    const sequence = await this.getNextSequence(dto.userId, session);
    const aggregateId = `${dto.userId}-${sequence}`;

    const event = await this.walletEventModel.create(
      [
        {
          userId: new Types.ObjectId(dto.userId),
          eventType: dto.eventType,
          amount: dto.amount,
          metadata: dto.metadata || {},
          aggregateId,
          sequence,
          correlationId: dto.correlationId,
          causationId: dto.causationId,
          timestamp: new Date(),
        },
      ],
      { session },
    );

    this.logger.log(
      `Event created: ${dto.eventType} for user ${dto.userId}, amount: ${dto.amount}`,
    );

    return event[0];
  }

  /**
   * الحصول على الرقم التسلسلي التالي للمستخدم
   */
  private async getNextSequence(
    userId: string,
    session?: ClientSession,
  ): Promise<number> {
    const lastEvent = (await this.walletEventModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ sequence: -1 })
      .session(session || null)
      .lean()) as unknown as WalletEvent;

    return lastEvent ? lastEvent.sequence + 1 : 1;
  }

  /**
   * جلب جميع الأحداث لمستخدم معين
   */
  async getUserEvents(
    userId: string,
    fromSequence = 0,
    limit = 1000,
  ): Promise<WalletEvent[]> {
    return (await this.walletEventModel
      .find({
        userId: new Types.ObjectId(userId),
        sequence: { $gte: fromSequence },
      })
      .sort({ sequence: 1 })
      .limit(limit)
      .lean()) as unknown as WalletEvent[];
  }

  /**
   * حساب حالة المحفظة من الأحداث (Event Sourcing)
   */
  async calculateStateFromEvents(userId: string): Promise<{
    balance: number;
    onHold: number;
    totalEarned: number;
    totalSpent: number;
  }> {
    const events = await this.getUserEvents(userId);

    let balance = 0;
    let onHold = 0;
    let totalEarned = 0;
    let totalSpent = 0;

    for (const event of events) {
      switch (event.eventType) {
        case WalletEventType.DEPOSIT:
        case WalletEventType.TOPUP:
        case WalletEventType.TRANSFER_IN:
        case WalletEventType.COMMISSION:
          balance += event.amount;
          totalEarned += event.amount;
          break;

        case WalletEventType.WITHDRAWAL:
        case WalletEventType.BILL_PAYMENT:
        case WalletEventType.TRANSFER_OUT:
          balance -= event.amount;
          totalSpent += event.amount;
          break;

        case WalletEventType.HOLD:
          onHold += event.amount;
          break;

        case WalletEventType.RELEASE:
          onHold -= event.amount;
          balance -= event.amount;
          totalSpent += event.amount;
          break;

        case WalletEventType.REFUND:
          onHold -= event.amount;
          break;
      }
    }

    return { balance, onHold, totalEarned, totalSpent };
  }

  /**
   * إنشاء Snapshot للحالة الحالية (للأداء)
   */
  async createSnapshot(userId: string): Promise<WalletSnapshot> {
    const state = await this.calculateStateFromEvents(userId);
    const lastEvent = (await this.walletEventModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ sequence: -1 })
      .lean()) as unknown as WalletEvent;

    return {
      userId,
      balance: state.balance,
      onHold: state.onHold,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      lastEventSequence: lastEvent?.sequence || 0,
      snapshotAt: new Date(),
    };
  }

  /**
   * إعادة بناء حالة المحفظة من الأحداث (Event Replay)
   */
  async replayEvents(userId: string): Promise<EventReplayResult> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      this.logger.log(`Starting event replay for user ${userId}`);

      // حساب الحالة من الأحداث
      const calculatedState = await this.calculateStateFromEvents(userId);

      // تحديث حالة المحفظة في قاعدة البيانات
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            'wallet.balance': calculatedState.balance,
            'wallet.onHold': calculatedState.onHold,
            'wallet.totalEarned': calculatedState.totalEarned,
            'wallet.totalSpent': calculatedState.totalSpent,
            'wallet.lastUpdated': new Date(),
          },
        },
        { session },
      );

      // وضع علامة على الأحداث كـ replayed
      const events = await this.getUserEvents(userId);
      await this.walletEventModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            isReplayed: true,
            replayedAt: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();

      this.logger.log(
        `Event replay completed for user ${userId}. Events: ${events.length}, Balance: ${calculatedState.balance}`,
      );

      return {
        success: true,
        eventsReplayed: events.length,
        finalBalance: calculatedState.balance,
        finalOnHold: calculatedState.onHold,
      };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Event replay failed for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return {
        success: false,
        eventsReplayed: 0,
        finalBalance: 0,
        finalOnHold: 0,
        errors: [(error as Error).message],
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * التحقق من صحة الأحداث (Audit)
   */
  async auditUserWallet(userId: string): Promise<{
    isValid: boolean;
    currentBalance: number;
    calculatedBalance: number;
    difference: number;
    details: string;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return {
        isValid: false,
        currentBalance: 0,
        calculatedBalance: 0,
        difference: 0,
        details: 'User not found',
      };
    }

    const calculatedState = await this.calculateStateFromEvents(userId);
    const currentBalance = user.wallet.balance;
    const difference = Math.abs(currentBalance - calculatedState.balance);

    const isValid = difference < 0.01; // tolerance for floating point

    const details = isValid
      ? 'Wallet state matches event history'
      : `Discrepancy detected: Current=${currentBalance}, Calculated=${calculatedState.balance}`;

    this.logger.log(`Audit for user ${userId}: ${details}`);

    return {
      isValid,
      currentBalance,
      calculatedBalance: calculatedState.balance,
      difference,
      details,
    };
  }

  /**
   * جلب الأحداث المرتبطة (بواسطة correlationId)
   */
  async getCorrelatedEvents(correlationId: string): Promise<WalletEvent[]> {
    return (await this.walletEventModel
      .find({ correlationId })
      .sort({ timestamp: 1 })
      .lean()) as unknown as WalletEvent[];
  }

  /**
   * إحصائيات الأحداث
   */
  async getEventStatistics(userId: string) {
    const events = await this.getUserEvents(userId);

    const stats = {
      totalEvents: events.length,
      byType: {} as Record<string, number>,
      totalAmount: {
        deposited: 0,
        withdrawn: 0,
        held: 0,
        released: 0,
      },
      firstEvent: events[0]?.timestamp,
      lastEvent: events[events.length - 1]?.timestamp,
    };

    events.forEach((event) => {
      // Count by type
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;

      // Sum amounts
      if (
        [
          WalletEventType.DEPOSIT,
          WalletEventType.TOPUP,
          WalletEventType.TRANSFER_IN,
        ].includes(event.eventType)
      ) {
        stats.totalAmount.deposited += event.amount;
      } else if (
        [
          WalletEventType.WITHDRAWAL,
          WalletEventType.BILL_PAYMENT,
          WalletEventType.TRANSFER_OUT,
        ].includes(event.eventType)
      ) {
        stats.totalAmount.withdrawn += event.amount;
      } else if (event.eventType === WalletEventType.HOLD) {
        stats.totalAmount.held += event.amount;
      } else if (event.eventType === WalletEventType.RELEASE) {
        stats.totalAmount.released += event.amount;
      }
    });

    return stats;
  }
}
