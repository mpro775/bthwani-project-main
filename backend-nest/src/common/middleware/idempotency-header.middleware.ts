import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IdempotencyHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to POST, PUT, PATCH methods
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const idempotencyKey = req.headers['idempotency-key'] as string;

      // Add idempotency key to request body if present
      if (idempotencyKey && req.body && typeof req.body === 'object') {
        req.body.idempotencyKey = idempotencyKey;
      }
    }

    next();
  }
}
