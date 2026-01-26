import axios from 'axios';

export class AnalyticsApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async analytics_controller_get_daily_roas(params?: { startDate?: any, endDate?: any, platform?: any }): Promise<any> {
    const url = `/analytics/roas/daily`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_roas_summary(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/roas/summary`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_roas_by_platform(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/roas/by-platform`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_calculate_roas(data?: any): Promise<any> {
    const url = `/analytics/roas/calculate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async analytics_controller_record_ad_spend(data?: any): Promise<any> {
    const url = `/analytics/adspend`;
    const config = {};

    return axios.post(url, data, config);
  }

  async analytics_controller_get_ad_spend(params?: { startDate?: any, endDate?: any, platform?: any }): Promise<any> {
    const url = `/analytics/adspend`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_ad_spend_summary(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/adspend/summary`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_k_p_is(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/kpis`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_real_time_k_p_is(): Promise<any> {
    const url = `/analytics/kpis/real-time`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_k_p_i_trends(params?: { metric?: any, period?: any }): Promise<any> {
    const url = `/analytics/kpis/trends`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_track_event(data?: any): Promise<any> {
    const url = `/analytics/events/track`;
    const config = {};

    return axios.post(url, data, config);
  }

  async analytics_controller_get_events(params?: { eventType?: any, startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/events`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_events_summary(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/events/summary`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_conversion_funnel(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/funnel/conversion`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_drop_off_points(): Promise<any> {
    const url = `/analytics/funnel/drop-off`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_user_growth(params?: { period?: any }): Promise<any> {
    const url = `/analytics/users/growth`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_user_retention(): Promise<any> {
    const url = `/analytics/users/retention`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_cohort_analysis(params?: { cohortDate?: any }): Promise<any> {
    const url = `/analytics/users/cohort`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_revenue_forecast(): Promise<any> {
    const url = `/analytics/revenue/forecast`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_revenue_breakdown(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/revenue/breakdown`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_dashboard_overview(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/advanced/dashboard-overview`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_cohort_analysis_advanced(params?: { type?: any }): Promise<any> {
    const url = `/analytics/advanced/cohort-analysis-advanced`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_funnel_analysis(params?: { funnelType?: any }): Promise<any> {
    const url = `/analytics/advanced/funnel-analysis`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_retention_rate(params?: { period?: any }): Promise<any> {
    const url = `/analytics/advanced/retention`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_customer_l_t_v(): Promise<any> {
    const url = `/analytics/advanced/ltv`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_churn_rate(params?: { period?: any }): Promise<any> {
    const url = `/analytics/advanced/churn-rate`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_geographic_distribution(params?: { metric?: any }): Promise<any> {
    const url = `/analytics/advanced/geographic-distribution`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_peak_hours(): Promise<any> {
    const url = `/analytics/advanced/peak-hours`;
    const config = {};

    return axios.get(url, config);
  }

  async analytics_controller_get_product_performance(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/advanced/product-performance`;
    const config = { params };

    return axios.get(url, config);
  }

  async analytics_controller_get_driver_performance(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/analytics/advanced/driver-performance`;
    const config = { params };

    return axios.get(url, config);
  }
}