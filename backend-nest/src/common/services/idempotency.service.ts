import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdempotencyRecord } from '../entities/idempotency.entity';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectModel(IdempotencyRecord.name) private idempotencyModel: Model<IdempotencyRecord>,
  ) {}

  /**
   * Check and acquire idempotency lock
   */
  async acquireLock(
    key: string,
    endpoint: string,
    method: string,
    userId?: string,
    ttlSeconds: number = 300, // 5 minutes default
  ): Promise<{ isNew: boolean; result?: any }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    try {
      // Try to create new record
      await this.idempotencyModel.create({
        key,
        endpoint,
        method,
        userId,
        expiresAt,
        createdAt: now,
      });

      return { isNew: true };
    } catch (error) {
      // Record already exists, check if it's completed
      const existing = await this.idempotencyModel.findOne({
        key,
        endpoint,
        method,
        userId: userId || null,
      });

      if (!existing) {
        throw new ConflictException('Unexpected error with idempotency key');
      }

      // Check if still processing (within 30 seconds)
      const processingWindow = 30 * 1000; // 30 seconds
      if (existing.createdAt.getTime() + processingWindow > now.getTime() && !existing.result) {
        throw new ConflictException(
          'Request is still being processed. Please wait and try again.'
        );
      }

      // Return cached result if available
      if (existing.result) {
        return {
          isNew: false,
          result: {
            ...existing.result,
            cached: true,
            idempotencyKey: key,
            processedAt: existing.processedAt
          }
        };
      }

      // Result is null (failed), allow retry
      return { isNew: true };
    }
  }

  /**
   * Complete idempotency operation with result
   */
  async completeOperation(key: string, endpoint: string, method: string, userId: string | undefined, result: any): Promise<void> {
    await this.idempotencyModel.updateOne(
      {
        key,
        endpoint,
        method,
        userId: userId || null,
      },
      {
        result,
        processedAt: new Date(),
      }
    );
  }

  /**
   * Mark operation as failed
   */
  async failOperation(key: string, endpoint: string, method: string, userId: string | undefined, error: any): Promise<void> {
    await this.idempotencyModel.updateOne(
      {
        key,
        endpoint,
        method,
        userId: userId || null,
      },
      {
        result: { error: error.message || 'Operation failed' },
        processedAt: new Date(),
      }
    );
  }

  /**
   * Clean up expired records (should be done by TTL, but manual cleanup available)
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.idempotencyModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  }
}
