import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginAttempt } from '../entities/login-attempt.entity';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(LoginAttempt.name)
    private loginAttemptModel: Model<LoginAttempt>,
  ) {}

  async logLoginAttempt(data: {
    identifier: string;
    ipAddress: string;
    userAgent?: string;
    status: 'success' | 'failure';
    failureReason?: string;
    userId?: string;
  }): Promise<LoginAttempt> {
    const attempt = new this.loginAttemptModel({
      ...data,
      device: this.extractDevice(data.userAgent),
      browser: this.extractBrowser(data.userAgent),
      isSuspicious: await this.checkIfSuspicious(data),
    });

    return await attempt.save();
  }

  async getFailedPasswordAttempts(
    threshold: number = 5,
    timeWindowMinutes: number = 15,
  ) {
    const since = new Date();
    since.setMinutes(since.getMinutes() - timeWindowMinutes);

    const attempts = await this.loginAttemptModel.aggregate([
      {
        $match: {
          status: 'failure',
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$identifier',
          count: { $sum: 1 },
          lastAttempt: { $max: '$createdAt' },
          ipAddresses: { $addToSet: '$ipAddress' },
        },
      },
      {
        $match: {
          count: { $gte: threshold },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return { data: attempts, total: attempts.length };
  }

  async checkRateLimit(
    identifier: string,
    ipAddress: string,
    maxAttempts: number = 5,
    windowMinutes: number = 15,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - windowMinutes);

    const attempts = await this.loginAttemptModel.countDocuments({
      $or: [{ identifier }, { ipAddress }],
      status: 'failure',
      createdAt: { $gte: since },
    });

    const resetAt = new Date(since);
    resetAt.setMinutes(resetAt.getMinutes() + windowMinutes);

    return {
      allowed: attempts < maxAttempts,
      remaining: Math.max(0, maxAttempts - attempts),
      resetAt,
    };
  }

  async getSuspiciousActivity(limit: number = 100) {
    const activities = await this.loginAttemptModel
      .find({ isSuspicious: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    return { data: activities, total: activities.length };
  }

  async getLoginHistory(
    identifier?: string,
    userId?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const query: Record<string, any> = {};
    if (identifier) query.identifier = identifier;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      this.loginAttemptModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.loginAttemptModel.countDocuments(query),
    ]);

    return {
      data: attempts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async checkIfSuspicious(data: {
    identifier: string;
    ipAddress: string;
    status: string;
  }): Promise<boolean> {
    // Check for multiple failed attempts
    const recentFailed = await this.loginAttemptModel.countDocuments({
      identifier: data.identifier,
      status: 'failure',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
    });

    if (recentFailed >= 3) return true;

    // Check for login from multiple IPs
    const recentIPs = await this.loginAttemptModel.distinct('ipAddress', {
      identifier: data.identifier,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    });

    if (recentIPs.length >= 5) return true;

    return false;
  }

  private extractDevice(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) return 'mobile';
    if (/Tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private extractBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    if (/Chrome/i.test(userAgent)) return 'Chrome';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Safari/i.test(userAgent)) return 'Safari';
    if (/Edge/i.test(userAgent)) return 'Edge';
    if (/Opera/i.test(userAgent)) return 'Opera';

    return 'unknown';
  }
}

