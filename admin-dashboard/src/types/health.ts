/**
 * Health Check Types
 */

export interface HealthCheckResult {
  status: 'ok' | 'error' | 'shutting_down';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

export interface HealthMetrics {
  timestamp: string;
  uptime: number;
  database: {
    connected: boolean;
    status: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    heapUsedPercent: number;
  };
  status: 'healthy' | 'unhealthy';
}

export interface DetailedHealth {
  status: string;
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  environment: {
    nodeEnv: string;
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
  };
  database: {
    status: string;
    readyState: number;
    name: string;
    host: string;
    collections: number;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    heapUsedPercent: number;
    external: number;
    arrayBuffers: number;
    unit: string;
  };
  cpu: {
    user: number;
    system: number;
    total: number;
    unit: string;
  };
}

export interface AppInfo {
  name: string;
  version: string;
  description: string;
  environment: string;
  nodeVersion: string;
  startTime: string;
  uptime: string;
  timezone: string;
}

