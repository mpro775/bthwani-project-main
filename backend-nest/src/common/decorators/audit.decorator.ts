import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string;
  resource: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const Audit = (
  action: string,
  resource: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
) =>
  SetMetadata(AUDIT_KEY, {
    action,
    resource,
    severity,
  } as AuditMetadata);

