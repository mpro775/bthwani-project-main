import { Injectable, NestMiddleware, BadRequestException, ConflictException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdempotencyRecord } from '../entities/idempotency.entity';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(IdempotencyRecord.name) private idempotencyModel: Model<IdempotencyRecord>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only apply to POST, PUT, PATCH methods
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Check if endpoint requires idempotency
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const endpoint = `${req.method} ${req.path}`;

    // Define critical endpoints that require idempotency
    const criticalEndpoints = [
      '/api/v2/payments',
      '/api/v2/wallet/transfer',
      '/api/v2/orders',
      '/auth/register',
      '/auth/login', // For OTP-based login
    ];

    const requiresIdempotency = criticalEndpoints.some(critical =>
      endpoint.includes(critical)
    );

    if (!requiresIdempotency) {
      return next();
    }

    // Validate idempotency key
    if (!idempotencyKey) {
      throw new BadRequestException(
        'Idempotency-Key header is required for this operation'
      );
    }

    // Validate key format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      throw new BadRequestException(
        'Idempotency-Key must be a valid UUID v4'
      );
    }

    // Get user ID from request (if authenticated)
    const userId = (req as any).user?.id || (req as any).user?.userId;

    try {
      // Check if key exists
      const existingRecord = await this.idempotencyModel.findOne({
        key: idempotencyKey,
        endpoint,
        method: req.method,
        userId: userId || null,
      });

      if (existingRecord) {
        // Check if request is still being processed
        const now = new Date();
        const processingTime = 30000; // 30 seconds

        if (existingRecord.createdAt.getTime() + processingTime > now.getTime() &&
            !existingRecord.result) {
          // Request is still being processed
          throw new ConflictException(
            'Request is still being processed. Please wait and try again.'
          );
        }

        // Return cached result
        if (existingRecord.result) {
          const result = existingRecord.result;
          res.status(200).json({
            ...result,
            cached: true,
            idempotencyKey,
            processedAt: existingRecord.createdAt
          });
          return;
        }
      }

      // Create new idempotency record
      await this.idempotencyModel.create({
        key: idempotencyKey,
        endpoint,
        method: req.method,
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Add idempotency info to request
      (req as any).idempotency = {
        key: idempotencyKey,
        recordId: null, // Will be set by service
      };

      next();
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      // Log error but don't block request
      console.error('Idempotency middleware error:', error);
      next();
    }
  }
}

// Decorator for services to mark completion
export function CompleteIdempotency(key: string, result: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);

        // Update idempotency record
        if (this.idempotencyModel && (args[0] as any)?.idempotency) {
          const idempotencyInfo = (args[0] as any).idempotency;
          await this.idempotencyModel.updateOne(
            { key: idempotencyInfo.key },
            {
              result,
              processedAt: new Date()
            }
          );
        }

        return result;
      } catch (error) {
        // Mark as failed
        if (this.idempotencyModel && (args[0] as any)?.idempotency) {
          const idempotencyInfo = (args[0] as any).idempotency;
          await this.idempotencyModel.updateOne(
            { key: idempotencyInfo.key },
            {
              result: { error: error.message },
              processedAt: new Date()
            }
          );
        }
        throw error;
      }
    };

    return descriptor;
  };
}