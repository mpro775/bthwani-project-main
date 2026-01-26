import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoasDaily } from './entities/roas-daily.entity';
import { AdSpend } from './entities/adspend.entity';
import { MarketingEvent } from './entities/marketing-event.entity';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(RoasDaily.name) private roasDailyModel: Model<RoasDaily>,
    @InjectModel(AdSpend.name) private adSpendModel: Model<AdSpend>,
    @InjectModel(MarketingEvent.name)
    private marketingEventModel: Model<MarketingEvent>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  // ==================== ROAS ====================

  async getDailyRoas(startDate?: string, endDate?: string, platform?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (platform) query.platform = platform;

    const data = await this.roasDailyModel
      .find(query)
      .sort({ date: -1 })
      .limit(30);
    return { data };
  }

  async getRoasSummary(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const result = await this.roasDailyModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAdSpend: { $sum: '$adSpend' },
          totalRevenue: { $sum: '$revenue' },
          totalOrders: { $sum: '$orders' },
          totalConversions: { $sum: '$conversions' },
        },
      },
    ]);

    const summary = result[0] || {
      totalAdSpend: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalConversions: 0,
    };
    const roas =
      summary.totalAdSpend > 0
        ? summary.totalRevenue / summary.totalAdSpend
        : 0;

    return { ...summary, roas };
  }

  async getRoasByPlatform(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const result = await this.roasDailyModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$platform',
          adSpend: { $sum: '$adSpend' },
          revenue: { $sum: '$revenue' },
          orders: { $sum: '$orders' },
        },
      },
      {
        $project: {
          platform: '$_id',
          adSpend: 1,
          revenue: 1,
          orders: 1,
          roas: {
            $cond: [
              { $gt: ['$adSpend', 0] },
              { $divide: ['$revenue', '$adSpend'] },
              0,
            ],
          },
        },
      },
      { $sort: { roas: -1 } },
    ]);

    return { data: result };
  }

  async calculateRoas(date: string) {
    // TODO: Calculate ROAS for a specific date
    return { success: true, message: 'ROAS calculated' };
  }

  // ==================== Ad Spend ====================

  async recordAdSpend(adSpendData: any) {
    const adSpend = await this.adSpendModel.create(adSpendData);
    return { success: true, adSpend };
  }

  async getAdSpend(startDate?: string, endDate?: string, platform?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (platform) query.platform = platform;

    const data = await this.adSpendModel.find(query).sort({ date: -1 });
    return { data, total: data.length };
  }

  async getAdSpendSummary(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const result = await this.adSpendModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$amount' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' },
        },
      },
    ]);

    return (
      result[0] || {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
      }
    );
  }

  // ==================== KPIs ====================

  async getKPIs(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [ordersData, revenueData] = await Promise.all([
      this.orderModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]),
      this.orderModel.aggregate([
        { $match: { ...query, status: 'delivered', paid: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),
    ]);

    const orders = ordersData[0] || {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };
    const revenue = revenueData[0] || { totalRevenue: 0, avgOrderValue: 0 };

    return {
      orders,
      revenue,
      conversionRate:
        orders.totalOrders > 0
          ? (orders.completedOrders / orders.totalOrders) * 100
          : 0,
      cancellationRate:
        orders.totalOrders > 0
          ? (orders.cancelledOrders / orders.totalOrders) * 100
          : 0,
    };
  }

  async getRealTimeKPIs() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [recentOrders, activeOrders] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      this.orderModel.countDocuments({
        status: {
          $in: ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'],
        },
      }),
    ]);

    return { recentOrders, activeOrders, timestamp: now };
  }

  async getKPITrends(metric: string, period: 'daily' | 'weekly' | 'monthly') {
    // TODO: Implement trend calculation
    return { data: [] };
  }

  // ==================== Marketing Events ====================

  async trackEvent(eventData: any) {
    const event = await this.marketingEventModel.create(eventData);
    return { success: true, eventId: event._id };
  }

  async getEvents(eventType?: string, startDate?: string, endDate?: string) {
    const query: any = {};
    if (eventType) query.eventType = eventType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const events = await this.marketingEventModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    return { data: events, total: events.length };
  }

  async getEventsSummary(startDate?: string, endDate?: string) {
    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const result = await this.marketingEventModel.aggregate([
      { $match: query },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return { data: result };
  }

  // ==================== Conversion Funnel ====================

  async getConversionFunnel(startDate?: string, endDate?: string) {
    // TODO: Calculate funnel stages
    return {
      stages: [
        { name: 'Visits', count: 0 },
        { name: 'Cart', count: 0 },
        { name: 'Checkout', count: 0 },
        { name: 'Completed', count: 0 },
      ],
    };
  }

  async getDropOffPoints() {
    // TODO: Identify where users drop off
    return { dropOffPoints: [] };
  }

  // ==================== User Analytics ====================

  async getUserGrowth(period: 'daily' | 'weekly' | 'monthly') {
    // TODO: Calculate user growth over time
    return { data: [] };
  }

  async getUserRetention() {
    // TODO: Calculate retention rate
    return { retentionRate: 0, cohorts: [] };
  }

  async getCohortAnalysis(cohortDate: string) {
    // TODO: Analyze user cohort
    return { cohort: {}, retention: [] };
  }

  // ==================== Revenue ====================

  async getRevenueForecast() {
    // TODO: Forecast based on trends
    return { forecast: [] };
  }

  async getRevenueBreakdown(startDate?: string, endDate?: string) {
    const query: any = { status: 'delivered', paid: true };
    if (startDate || endDate) {
      query.deliveredAt = {};
      if (startDate) query.deliveredAt.$gte = new Date(startDate);
      if (endDate) query.deliveredAt.$lte = new Date(endDate);
    }

    const result = await this.orderModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          productsRevenue: { $sum: '$price' },
          deliveryFees: { $sum: '$deliveryFee' },
          platformShare: { $sum: '$platformShare' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    return (
      result[0] || {
        productsRevenue: 0,
        deliveryFees: 0,
        platformShare: 0,
        totalRevenue: 0,
      }
    );
  }

  // ==================== Advanced Analytics ====================

  async getDashboardOverview(startDate?: string, endDate?: string) {
    // TODO: Comprehensive dashboard metrics
    return {
      revenue: { total: 0, growth: 0 },
      orders: { total: 0, growth: 0 },
      users: { total: 0, active: 0, new: 0 },
      drivers: { total: 0, active: 0 },
      stores: { total: 0, active: 0 },
      topMetrics: [],
    };
  }

  async getCohortAnalysisAdvanced(type: string) {
    // TODO: User cohort analysis by registration date
    return {
      cohorts: [],
      retentionMatrix: [],
    };
  }

  async getFunnelAnalysis(funnelType: string) {
    // TODO: Conversion funnel (Browse → Add to Cart → Checkout → Complete)
    return {
      stages: [
        { name: 'Browse', users: 0, conversion: 100 },
        { name: 'Add to Cart', users: 0, conversion: 0 },
        { name: 'Checkout', users: 0, conversion: 0 },
        { name: 'Complete', users: 0, conversion: 0 },
      ],
    };
  }

  async getRetentionRate(period: string) {
    // TODO: Calculate retention rate over period
    return {
      period,
      rate: 0,
      byPeriod: [],
    };
  }

  async getCustomerLTV() {
    // TODO: Calculate average customer lifetime value
    return {
      averageLTV: 0,
      bySegment: [],
      trend: [],
    };
  }

  async getChurnRate(period: string) {
    // TODO: Calculate churn rate
    return {
      period,
      rate: 0,
      byPeriod: [],
      reasons: [],
    };
  }

  async getGeographicDistribution(metric: string) {
    // TODO: Aggregate by city/region
    return {
      byCity: [],
      byRegion: [],
      total: 0,
    };
  }

  async getPeakHours() {
    // TODO: Aggregate orders by hour
    return {
      byHour: [],
      peakHour: '',
      byDayOfWeek: [],
    };
  }

  async getProductPerformance(startDate?: string, endDate?: string) {
    // TODO: Top products, revenue, quantity
    return {
      topProducts: [],
      slowMoving: [],
      trending: [],
    };
  }

  async getDriverPerformance(startDate?: string, endDate?: string) {
    // TODO: Driver metrics
    return {
      topDrivers: [],
      averageDeliveryTime: 0,
      completionRate: 0,
    };
  }
}
