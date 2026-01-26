import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../modules/admin/entities/audit-log.entity';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, url, body, ip, headers } = request;

    const logData = {
      userId: user?.id || user?._id,
      userEmail: user?.email,
      userRole: user?.role,
      action: auditMetadata.action,
      resource: auditMetadata.resource,
      method,
      endpoint: url,
      requestBody: this.sanitizeBody(body),
      ipAddress: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
      userAgent: headers['user-agent'],
      severity: auditMetadata.severity || 'medium',
      flagged: false,
    };

    return next.handle().pipe(
      tap(async (data) => {
        // Success case
        await this.createAuditLog({
          ...logData,
          status: 'success',
          newData: data,
        });
      }),
      catchError((error) => {
        // Error case
        this.createAuditLog({
          ...logData,
          status: 'error',
          errorMessage: error.message,
          severity: 'critical',
          flagged: true,
        }).catch((err) => console.error('Failed to log audit:', err));

        return throwError(() => error);
      }),
    );
  }

  private async createAuditLog(data: any) {
    try {
      const log = new this.auditLogModel(data);
      await log.save();
    } catch (error) {
      console.error('Audit log creation failed:', error);
    }
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}

