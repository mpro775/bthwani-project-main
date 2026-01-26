import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Payments } from './entities/payments.entity';
import { WalletService } from '../wallet/wallet.service';
import { IdempotencyService } from '../../common/services/idempotency.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payments.name) private readonly model: Model<Payments>,
    private readonly wallet: WalletService,
    private readonly idempotency: IdempotencyService
  ) {}

  async createHold(dto: { userId: string; amount: number; reference: string; idempotencyKey?: string }) {
    const { idempotencyKey, ...holdDto } = dto;

    if (idempotencyKey) {
      // Check idempotency
      const lockResult = await this.idempotency.acquireLock(
        idempotencyKey,
        'POST /api/v2/payments/holds',
        'POST',
        dto.userId
      );

      if (!lockResult.isNew && lockResult.result) {
        return lockResult.result;
      }

      try {
        const result = await this.wallet.holdFunds(holdDto.userId, holdDto.amount, holdDto.reference);
        await this.idempotency.completeOperation(
          idempotencyKey,
          'POST /api/v2/payments/holds',
          'POST',
          dto.userId,
          result
        );
        return result;
      } catch (error) {
        await this.idempotency.failOperation(
          idempotencyKey,
          'POST /api/v2/payments/holds',
          'POST',
          dto.userId,
          error
        );
        throw error;
      }
    }

    return this.wallet.holdFunds(holdDto.userId, holdDto.amount, holdDto.reference);
  }

  async release(userId: string, amount: number, orderId?: string) {
    return this.wallet.releaseFunds(userId, amount, orderId);
  }

  async refund(userId: string, amount: number, orderId?: string) {
    return this.wallet.refundHeldFunds(userId, amount, orderId);
  }

  async getHold(holdId: string) {
    // TODO: Implement hold retrieval - holds are currently managed as balance adjustments
    throw new Error('Hold retrieval not implemented');
  }

  async getHoldsByUser(userId: string) {
    // TODO: Implement holds by user - holds are currently managed as balance adjustments
    return { holds: [], total: 0 };
  }

  async list(filters: any = {}, cursor?: string, limit: number = 25) {
    const query = this.model.find().populate('ownerId', 'name email phone').sort({ _id: -1 });

    // Apply filters
    if (filters.status) query.where('status').equals(filters.status);
    if (filters.type) query.where('type').equals(filters.type);
    if (filters.method) query.where('method').equals(filters.method);
    if (filters.ownerId) query.where('ownerId').equals(filters.ownerId);
    if (filters.amountMin) query.where('amount').gte(filters.amountMin);
    if (filters.amountMax) query.where('amount').lte(filters.amountMax);
    if (filters.reference) query.where('reference').equals(filters.reference);
    if (filters.createdAfter) query.where('createdAt').gte(filters.createdAfter);
    if (filters.createdBefore) query.where('createdAt').lte(filters.createdBefore);
    if (filters.search) {
      query.or([
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ]);
    }

    if (cursor) {
      query.where('_id').lt(Number(cursor));
    }

    query.limit(limit + 1); // +1 to check if there are more items

    const items = await query.exec();
    const hasNextPage = items.length > limit;
    const resultItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? String(resultItems[resultItems.length - 1]._id) : null;

    return { items: resultItems, nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('ownerId', 'name email phone').exec();
    if (!doc) throw new NotFoundException('Payment not found');
    return doc;
  }

  async update(id: string, dto: any) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Payment not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Payment not found');
    return { ok: true };
  }

  async getStats() {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const typeStats = await this.model.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      totalAmount: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      refunded: 0,
      deposits: 0,
      withdrawals: 0,
      transfers: 0,
      payments: 0,
      refunds: 0,
      commissions: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.totalAmount += stat.totalAmount || 0;
      result[stat._id] = stat.count;
    });

    typeStats.forEach(stat => {
      const typeKey = stat._id + 's'; // deposits, withdrawals, etc.
      result[typeKey] = stat.count;
    });

    return result;
  }

  async createPaymentSession(dto: {
    amount: number;
    currency?: string;
    description: string;
    metadata?: any;
    returnUrl?: string;
    cancelUrl?: string;
  }) {
    // TODO: Integrate with actual payment provider (Stripe, PayPal, etc.)
    // For now, return a mock session

    const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: sessionId,
      url: dto.returnUrl || `https://example.com/payment/${sessionId}`,
      amount: dto.amount,
      currency: dto.currency || 'SAR',
      description: dto.description,
      metadata: dto.metadata,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }

  async confirmPayment(dto: {
    sessionId: string;
    paymentMethodId?: string;
    returnUrl?: string;
  }) {
    // TODO: Integrate with actual payment provider
    // For now, return a mock confirmation

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: dto.sessionId,
      status: 'succeeded',
      amount: 100.50, // This would come from the session
      currency: 'SAR',
      paymentMethod: dto.paymentMethodId || 'mock_pm_123',
      confirmedAt: new Date().toISOString(),
      receiptUrl: `https://example.com/receipt/${dto.sessionId}`,
    };
  }
}
