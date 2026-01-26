import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface RuntimeEndpointCall {
  method: string;
  path: string;
  timestamp: Date;
  statusCode: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

@Injectable()
export class RuntimeTapService {
  private readonly logger = new Logger(RuntimeTapService.name);
  private readonly tapData: Map<string, RuntimeEndpointCall[]> = new Map();
  private readonly reportsDir = path.join(process.cwd(), 'reports');
  private readonly tapFile = path.join(this.reportsDir, 'runtime-tap-24h.json');

  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Load existing tap data if available
    this.loadExistingData();
  }

  /**
   * Record an endpoint call
   */
  recordCall(call: RuntimeEndpointCall): void {
    const key = `${call.method}:${call.path}`;

    if (!this.tapData.has(key)) {
      this.tapData.set(key, []);
    }

    const calls = this.tapData.get(key)!;
    calls.push(call);

    // Keep only last 24 hours of data
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCalls = calls.filter(c => c.timestamp >= oneDayAgo);

    if (recentCalls.length !== calls.length) {
      this.tapData.set(key, recentCalls);
    }
  }

  /**
   * Get all recorded endpoints in the last 24 hours
   */
  getRecordedEndpoints(): { method: string; path: string; callCount: number; lastCall: Date }[] {
    const result: { method: string; path: string; callCount: number; lastCall: Date }[] = [];

    for (const [key, calls] of this.tapData) {
      if (calls.length > 0) {
        const [method, path] = key.split(':');
        const lastCall = calls[calls.length - 1].timestamp;
        result.push({
          method,
          path,
          callCount: calls.length,
          lastCall,
        });
      }
    }

    return result.sort((a, b) => b.lastCall.getTime() - a.lastCall.getTime());
  }

  /**
   * Compare with FE static analysis report
   */
  async compareWithFEStaticAnalysis(): Promise<{
    matched: { method: string; path: string; callCount: number }[];
    unmatched: { method: string; path: string; callCount: number }[];
    feOnly: string[];
  }> {
    const beEndpoints = this.getRecordedEndpoints();
    const feEndpointsPath = path.join(this.reportsDir, 'fe-static-endpoints.json');

    let feEndpoints: string[] = [];

    try {
      if (fs.existsSync(feEndpointsPath)) {
        const feData = JSON.parse(fs.readFileSync(feEndpointsPath, 'utf8'));
        feEndpoints = feData.endpoints || [];
      } else {
        this.logger.warn('FE static analysis report not found');
      }
    } catch (error) {
      this.logger.error('Failed to load FE static analysis report:', error);
    }

    const matched: { method: string; path: string; callCount: number }[] = [];
    const unmatched: { method: string; path: string; callCount: number }[] = [];

    // Check BE endpoints against FE
    for (const beEndpoint of beEndpoints) {
      const fullPath = `${beEndpoint.method} ${beEndpoint.path}`;
      if (feEndpoints.includes(fullPath)) {
        matched.push(beEndpoint);
      } else {
        unmatched.push(beEndpoint);
      }
    }

    // Find FE-only endpoints
    const bePaths = new Set(beEndpoints.map(e => `${e.method} ${e.path}`));
    const feOnly = feEndpoints.filter(fePath => !bePaths.has(fePath));

    return {
      matched,
      unmatched,
      feOnly,
    };
  }

  /**
   * Generate comparison report
   */
  async generateComparisonReport(): Promise<void> {
    const comparison = await this.compareWithFEStaticAnalysis();
    const report = {
      generatedAt: new Date().toISOString(),
      period: '24 hours',
      backendEndpoints: {
        total: this.getRecordedEndpoints().length,
        matched: comparison.matched.length,
        unmatched: comparison.unmatched.length,
      },
      frontendEndpoints: {
        total: comparison.matched.length + comparison.feOnly.length,
        matched: comparison.matched.length,
        unmatched: comparison.feOnly.length,
      },
      details: {
        matched: comparison.matched,
        unmatched: comparison.unmatched,
        feOnly: comparison.feOnly,
      },
      summary: {
        coverage: comparison.matched.length / (comparison.matched.length + comparison.feOnly.length) * 100,
        unused: comparison.unmatched.length,
        missing: comparison.feOnly.length,
      },
    };

    const reportPath = path.join(this.reportsDir, 'runtime-fe-comparison.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.logger.log(`Runtime-FE comparison report generated: ${reportPath}`);
  }

  /**
   * Save tap data to disk (every 5 minutes)
   */
  @Cron('0 */5 * * * *') // Every 5 minutes
  private saveTapData(): void {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        endpoints: Array.from(this.tapData.entries()).map(([key, calls]) => ({
          endpoint: key,
          calls: calls.map(c => ({
            timestamp: c.timestamp.toISOString(),
            statusCode: c.statusCode,
            userAgent: c.userAgent,
            ip: c.ip,
            userId: c.userId,
          })),
        })),
      };

      fs.writeFileSync(this.tapFile, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error('Failed to save tap data:', error);
    }
  }

  /**
   * Generate daily report (every day at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async generateDailyReport(): Promise<void> {
    await this.generateComparisonReport();

    // Clean up old data (keep only last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [key, calls] of this.tapData) {
      const recentCalls = calls.filter(c => c.timestamp >= oneDayAgo);
      if (recentCalls.length === 0) {
        this.tapData.delete(key);
      } else {
        this.tapData.set(key, recentCalls);
      }
    }

    this.logger.log('Daily runtime tap report generated');
  }

  /**
   * Load existing tap data from disk
   */
  private loadExistingData(): void {
    try {
      if (fs.existsSync(this.tapFile)) {
        const data = JSON.parse(fs.readFileSync(this.tapFile, 'utf8'));
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        for (const endpoint of data.endpoints || []) {
          const calls: RuntimeEndpointCall[] = endpoint.calls
            .map((c: any) => ({
              method: endpoint.endpoint.split(':')[0],
              path: endpoint.endpoint.split(':')[1],
              timestamp: new Date(c.timestamp),
              statusCode: c.statusCode,
              userAgent: c.userAgent,
              ip: c.ip,
              userId: c.userId,
            }))
            .filter((c: RuntimeEndpointCall) => c.timestamp >= oneDayAgo);

          if (calls.length > 0) {
            this.tapData.set(endpoint.endpoint, calls);
          }
        }

        this.logger.log(`Loaded ${this.tapData.size} endpoints from existing tap data`);
      }
    } catch (error) {
      this.logger.error('Failed to load existing tap data:', error);
    }
  }
}
