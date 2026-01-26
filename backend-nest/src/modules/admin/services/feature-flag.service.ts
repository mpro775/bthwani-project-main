import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeatureFlag } from '../entities/feature-flag.entity';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectModel(FeatureFlag.name)
    private featureFlagModel: Model<FeatureFlag>,
  ) {}

  async isEnabled(
    key: string,
    userId?: string,
    userRole?: string,
  ): Promise<boolean> {
    const flag = await this.featureFlagModel.findOne({ key });

    if (!flag) {
      return false; // Feature not found = disabled by default
    }

    // Check if feature is globally enabled
    if (!flag.enabled) {
      return false;
    }

    // Check environment
    const currentEnv = process.env.NODE_ENV || 'development';
    if (flag.environment !== 'all' && flag.environment !== currentEnv) {
      return false;
    }

    // Check date range
    const now = new Date();
    if (flag.startDate && now < flag.startDate) {
      return false;
    }
    if (flag.endDate && now > flag.endDate) {
      return false;
    }

    // Check user-specific access
    if (userId && flag.enabledForUsers.length > 0) {
      return flag.enabledForUsers.includes(userId);
    }

    // Check role-specific access
    if (userRole && flag.enabledForRoles.length > 0) {
      return flag.enabledForRoles.includes(userRole);
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && userId) {
      const hash = this.hashUserId(userId + key);
      return hash < flag.rolloutPercentage;
    }

    return true;
  }

  async getFeatureFlags() {
    const flags = await this.featureFlagModel
      .find()
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .sort({ key: 1 });

    return { data: flags, total: flags.length };
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException({
        code: 'FEATURE_FLAG_NOT_FOUND',
        userMessage: 'العلامة غير موجودة',
      });
    }
    return flag;
  }

  async updateFeatureFlag(
    key: string,
    enabled: boolean,
    adminId: string,
  ): Promise<FeatureFlag> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException({
        code: 'FEATURE_FLAG_NOT_FOUND',
        userMessage: 'العلامة غير موجودة',
      });
    }

    flag.enabled = enabled;
    flag.updatedBy = new Types.ObjectId(adminId);

    await flag.save();

    // TODO: Clear cache
    // TODO: Log audit trail

    return flag;
  }

  async createFeatureFlag(data: {
    key: string;
    name: string;
    description?: string;
    enabled?: boolean;
    environment?: string;
    rolloutPercentage?: number;
    adminId: string;
  }): Promise<FeatureFlag> {
    const existing = await this.featureFlagModel.findOne({ key: data.key });
    if (existing) {
      throw new Error('Feature flag with this key already exists');
    }

    const flag = new this.featureFlagModel({
      key: data.key,
      name: data.name,
      description: data.description,
      enabled: data.enabled || false,
      environment: data.environment || 'all',
      rolloutPercentage: data.rolloutPercentage,
      createdBy: new Types.ObjectId(data.adminId),
      updatedBy: new Types.ObjectId(data.adminId),
    });

    return await flag.save();
  }

  async updateFeatureFlagDetails(
    key: string,
    updates: Partial<FeatureFlag>,
    adminId: string,
  ): Promise<FeatureFlag> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException({
        code: 'FEATURE_FLAG_NOT_FOUND',
        userMessage: 'العلامة غير موجودة',
      });
    }

    Object.assign(flag, updates);
    flag.updatedBy = new Types.ObjectId(adminId);

    await flag.save();

    return flag;
  }

  async deleteFeatureFlag(key: string): Promise<void> {
    const result = await this.featureFlagModel.deleteOne({ key });
    if (result.deletedCount === 0) {
      throw new NotFoundException({
        code: 'FEATURE_FLAG_NOT_FOUND',
        userMessage: 'العلامة غير موجودة',
      });
    }
  }

  // Helper: Hash user ID to number between 0-100 for percentage rollout
  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }
}
