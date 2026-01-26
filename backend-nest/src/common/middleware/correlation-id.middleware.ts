import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// تمديد Express Request لإضافة correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // الحصول على correlation ID من header أو إنشاء واحد جديد
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    // حفظ correlation ID في request
    req.correlationId = correlationId;

    // حفظ وقت بدء الطلب للـ metrics
    req.startTime = Date.now();

    // إضافة correlation ID في response headers
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-request-id', correlationId);

    // إضافة معلومات إضافية للتتبع
    res.setHeader('x-powered-by', 'Bthwani');

    next();
  }
}

