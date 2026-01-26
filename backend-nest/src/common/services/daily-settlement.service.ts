import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SettlementRecord } from '../entities/settlement.entity';
import { WalletTransaction } from '../../modules/wallet/entities/wallet-transaction.entity';

@Injectable()
export class DailySettlementService {
  private readonly logger = new Logger(DailySettlementService.name);

  constructor(
    @InjectModel(SettlementRecord.name) private settlementModel: Model<SettlementRecord>,
    @InjectModel(WalletTransaction.name) private transactionModel: Model<WalletTransaction>,
  ) {}

  /**
   * Automated daily settlement - runs at 11 PM every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async performDailySettlement() {
    this.logger.log('Starting daily settlement process...');

    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if settlement already exists
      const existingSettlement = await this.settlementModel.findOne({ date: dateStr });
      if (existingSettlement) {
        this.logger.warn(`Settlement for ${dateStr} already exists`);
        return;
      }

      // Create settlement record
      const settlement = await this.settlementModel.create({
        date: dateStr,
        status: 'processing',
      });

      await this.processSettlement(settlement);

    } catch (error) {
      this.logger.error('Daily settlement failed:', error);
    }
  }

  /**
   * Manual settlement trigger
   */
  async triggerManualSettlement(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    this.logger.log(`Triggering manual settlement for ${dateStr}`);

    const settlement = await this.settlementModel.create({
      date: dateStr,
      status: 'processing',
    });

    return this.processSettlement(settlement);
  }

  private async processSettlement(settlement: any) {
    try {
      const startOfDay = new Date(settlement.date + 'T00:00:00.000Z');
      const endOfDay = new Date(settlement.date + 'T23:59:59.999Z');

      // Aggregate transaction data
      const transactionStats = await this.transactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['completed', 'failed', 'cancelled'] }
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalVolume: { $sum: '$amount' },
            successfulTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            settlementAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
              }
            }
          }
        }
      ]);

      const stats = transactionStats[0] || {
        totalTransactions: 0,
        totalVolume: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        settlementAmount: 0,
      };

      // Calculate fees (example: 2.5% of successful transactions)
      const feeRate = 0.025;
      const fees = stats.settlementAmount * feeRate;
      const netAmount = stats.settlementAmount - fees;

      // Update settlement record
      await this.settlementModel.updateOne(
        { _id: settlement._id },
        {
          totalTransactions: stats.totalTransactions,
          totalVolume: stats.totalVolume,
          successfulTransactions: stats.successfulTransactions,
          failedTransactions: stats.failedTransactions,
          settlementAmount: stats.settlementAmount,
          fees,
          netAmount,
          status: 'completed',
          processedAt: new Date(),
        }
      );

      this.logger.log(`Settlement completed for ${settlement.date}: ${stats.totalTransactions} transactions, $${netAmount} net amount`);

      // Trigger notifications
      await this.notifySettlementCompletion(settlement.date, stats, netAmount);

      return {
        date: settlement.date,
        ...stats,
        fees,
        netAmount,
        status: 'completed',
      };

    } catch (error) {
      this.logger.error(`Settlement processing failed for ${settlement.date}:`, error);

      await this.settlementModel.updateOne(
        { _id: settlement._id },
        {
          status: 'failed',
          errorMessage: error.message,
          processedAt: new Date(),
        }
      );

      throw error;
    }
  }

  private async notifySettlementCompletion(date: string, stats: any, netAmount: number) {
    // Send notifications to finance team
    // This could integrate with email service, Slack, etc.

    const message = `
Daily Settlement Report - ${date}

📊 Summary:
- Total Transactions: ${stats.totalTransactions}
- Successful: ${stats.successfulTransactions}
- Failed: ${stats.failedTransactions}
- Total Volume: $${stats.totalVolume}
- Settlement Amount: $${stats.settlementAmount}
- Fees: $${stats.fees}
- Net Amount: $${netAmount}

Status: ✅ Completed
    `.trim();

    this.logger.log('Settlement notification:', message);

    // TODO: Integrate with notification service
    // await this.notificationService.sendToFinanceTeam(message);
  }

  /**
   * Get settlement history
   */
  async getSettlementHistory(limit: number = 30) {
    return this.settlementModel
      .find()
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get settlement by date
   */
  async getSettlementByDate(date: string) {
    return this.settlementModel.findOne({ date });
  }

  /**
   * Retry failed settlements
   */
  async retryFailedSettlement(date: string) {
    const settlement = await this.settlementModel.findOne({
      date,
      status: 'failed'
    });

    if (!settlement) {
      throw new Error(`No failed settlement found for ${date}`);
    }

    this.logger.log(`Retrying failed settlement for ${date}`);
    return this.processSettlement(settlement);
  }
}
