import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PerformanceMetric, PerformanceBudget } from '../entities/performance.entity';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  // Performance budgets - Core Web Vitals aligned
  private readonly DEFAULT_BUDGETS: Omit<PerformanceBudget, 'lastUpdated'>[] = [
    // API Endpoints - Backend Performance
    {
      endpoint: '/api/v2/orders',
      method: 'GET',
      lcpThreshold: 2500, // 2.5s for list endpoints
      inpThreshold: 200, // 200ms for interactions
      responseTimeThreshold: 1000, // 1s general response
      errorRateThreshold: 1, // 1% error rate
    },
    {
      endpoint: '/api/v2/orders',
      method: 'POST',
      lcpThreshold: 3000, // 3s for creation (includes validation)
      inpThreshold: 300,
      responseTimeThreshold: 1500,
      errorRateThreshold: 2,
    },
    {
      endpoint: '/api/v2/payments',
      method: 'POST',
      lcpThreshold: 5000, // 5s for payment processing
      inpThreshold: 500,
      responseTimeThreshold: 3000,
      errorRateThreshold: 0.5, // Very low tolerance for payments
    },
    {
      endpoint: '/api/v2/wallet',
      method: 'GET',
      lcpThreshold: 2000,
      inpThreshold: 200,
      responseTimeThreshold: 800,
      errorRateThreshold: 1,
    },
    // Authentication endpoints
    {
      endpoint: '/auth/login',
      method: 'POST',
      lcpThreshold: 3000,
      inpThreshold: 500,
      responseTimeThreshold: 2000,
      errorRateThreshold: 5, // Higher tolerance for auth failures
    },
    // Search endpoints
    {
      endpoint: '/api/v2/search',
      method: 'GET',
      lcpThreshold: 4000, // Search can be slower
      inpThreshold: 300,
      responseTimeThreshold: 2500,
      errorRateThreshold: 2,
    },
  ];

  constructor(
    @InjectModel(PerformanceMetric.name) private metricModel: Model<PerformanceMetric>,
    @InjectModel(PerformanceBudget.name) private budgetModel: Model<PerformanceBudget>,
  ) {}

  /**
   * Record performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'expiresAt'>): Promise<void> {
    try {
      await this.metricModel.create({
        ...metric,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } catch (error) {
      this.logger.error('Failed to record performance metric:', error);
    }
  }

  /**
   * Check if metric violates budget
   */
  async checkBudgetViolation(metric: Omit<PerformanceMetric, 'expiresAt' | 'userAgent' | 'ip' | 'metadata'>): Promise<{
    violated: boolean;
    violations: string[];
    budget?: PerformanceBudget;
  }> {
    const budget = await this.budgetModel.findOne({
      endpoint: metric.endpoint,
      method: metric.method,
    });

    if (!budget) {
      return { violated: false, violations: [] };
    }

    const violations: string[] = [];

    // Check response time
    if (metric.responseTime > budget.responseTimeThreshold) {
      violations.push(`Response time ${metric.responseTime}ms > ${budget.responseTimeThreshold}ms`);
    }

    // Check LCP (approximated by response time for backend)
    if (metric.responseTime > budget.lcpThreshold) {
      violations.push(`LCP ${metric.responseTime}ms > ${budget.lcpThreshold}ms`);
    }

    // Check INP (interaction delay - approximated)
    if (metric.responseTime > budget.inpThreshold) {
      violations.push(`INP ${metric.responseTime}ms > ${budget.inpThreshold}ms`);
    }

    return {
      violated: violations.length > 0,
      violations,
      budget,
    };
  }

  /**
   * Get performance report for endpoint
   */
  async getPerformanceReport(
    endpoint?: string,
    method?: string,
    hours: number = 24,
  ): Promise<any> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const matchConditions: any = { timestamp: { $gte: startTime } };
    if (endpoint) matchConditions.endpoint = endpoint;
    if (method) matchConditions.method = method;

    const metrics = await this.metricModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            endpoint: '$endpoint',
            method: '$method',
            statusCode: '$statusCode',
          },
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          responseTimes: { $push: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
        },
      },
      {
        $addFields: {
          sortedResponseTimes: { $sortArray: { input: '$responseTimes', sortBy: 1 } },
        },
      },
      {
        $addFields: {
          p95Index: { $floor: { $multiply: [0.95, { $size: '$sortedResponseTimes' }] } },
          p99Index: { $floor: { $multiply: [0.99, { $size: '$sortedResponseTimes' }] } },
        },
      },
      {
        $addFields: {
          p95ResponseTime: { $arrayElemAt: ['$sortedResponseTimes', '$p95Index'] },
          p99ResponseTime: { $arrayElemAt: ['$sortedResponseTimes', '$p99Index'] },
        },
      },
      {
        $group: {
          _id: { endpoint: '$_id.endpoint', method: '$_id.method' },
          totalRequests: { $sum: '$count' },
          avgResponseTime: { $avg: '$avgResponseTime' },
          p95ResponseTime: { $first: '$p95ResponseTime' },
          p99ResponseTime: { $first: '$p99ResponseTime' },
          minResponseTime: { $min: '$minResponseTime' },
          maxResponseTime: { $max: '$maxResponseTime' },
          statusCodes: {
            $push: {
              code: '$_id.statusCode',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          endpoint: '$_id.endpoint',
          method: '$_id.method',
          totalRequests: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          p95ResponseTime: { $round: ['$p95ResponseTime', 2] },
          p99ResponseTime: { $round: ['$p99ResponseTime', 2] },
          minResponseTime: { $round: ['$minResponseTime', 2] },
          maxResponseTime: { $round: ['$maxResponseTime', 2] },
          errorRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $sum: {
                          $map: {
                            input: '$statusCodes',
                            as: 'status',
                            in: {
                              $cond: [
                                { $gte: ['$$status.code', 500] },
                                '$$status.count',
                                0,
                              ],
                            },
                          },
                        },
                      },
                      '$totalRequests',
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    return metrics;
  }

  /**
   * Initialize default performance budgets
   */
  async initializeBudgets(): Promise<void> {
    for (const budget of this.DEFAULT_BUDGETS) {
      await this.budgetModel.updateOne(
        {
          endpoint: budget.endpoint,
          method: budget.method,
        },
        {
          ...budget,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }

    this.logger.log('Performance budgets initialized');
  }

  /**
   * Update performance budget
   */
  async updateBudget(
    endpoint: string,
    method: string,
    updates: Partial<PerformanceBudget>,
  ): Promise<PerformanceBudget> {
    const budget = await this.budgetModel.findOneAndUpdate(
      { endpoint, method },
      {
        ...updates,
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    this.logger.log(`Updated performance budget for ${method} ${endpoint}`);
    return budget;
  }

  /**
   * Get all performance budgets
   */
  async getAllBudgets(): Promise<PerformanceBudget[]> {
    return this.budgetModel.find().sort({ endpoint: 1, method: 1 });
  }

  /**
   * Daily performance analysis and alerting
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async dailyPerformanceAnalysis(): Promise<void> {
    this.logger.log('Running daily performance analysis...');

    try {
      const report = await this.getPerformanceReport(undefined, undefined, 24);

      for (const endpoint of report) {
        const budget = await this.budgetModel.findOne({
          endpoint: endpoint.endpoint,
          method: endpoint.method,
        });

        if (!budget) continue;

        const alerts = [];

        // Check error rate
        if (endpoint.errorRate > budget.errorRateThreshold) {
          alerts.push(`Error rate ${endpoint.errorRate}% > ${budget.errorRateThreshold}%` as never);
        }

        // Check P95 response time
        if (endpoint.p95ResponseTime > budget.responseTimeThreshold) {
          alerts.push(`P95 ${endpoint.p95ResponseTime}ms > ${budget.responseTimeThreshold}ms` as never);
        }

        if (alerts.length > 0) {
          this.logger.warn(
            `Performance alert for ${endpoint.method} ${endpoint.endpoint}: ${alerts.join(', ')}`
          );

          // TODO: Send alert notification
          // await this.notificationService.sendPerformanceAlert(endpoint, alerts);
        }
      }

      this.logger.log('Daily performance analysis completed');

    } catch (error) {
      this.logger.error('Daily performance analysis failed:', error);
    }
  }

  /**
   * Clean up old metrics (keep last 30 days)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldMetrics(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.metricModel.deleteMany({
      timestamp: { $lt: thirtyDaysAgo },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} old performance metrics`);
    return result.deletedCount;
  }
}
