import axios from 'axios';

export class MarketerApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async marketer_controller_get_profile(): Promise<any> {
    const url = `/marketer/profile`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_update_profile(data?: any): Promise<any> {
    const url = `/marketer/profile`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async marketer_controller_generate_referral_code(data?: any): Promise<any> {
    const url = `/marketer/referrals/generate-code`;
    const config = {};

    return axios.post(url, data, config);
  }

  async marketer_controller_get_my_referrals(): Promise<any> {
    const url = `/marketer/referrals/my`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_referral_statistics(): Promise<any> {
    const url = `/marketer/referrals/statistics`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_my_stores(): Promise<any> {
    const url = `/marketer/stores/my`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_store_details(id: string): Promise<any> {
    const url = `/marketer/stores/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_store_performance(id: string, params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/marketer/stores/${id}/performance`;
    const config = { params };

    return axios.get(url, config);
  }

  async marketer_controller_get_my_vendors(): Promise<any> {
    const url = `/marketer/vendors/my`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_vendor_details(id: string): Promise<any> {
    const url = `/marketer/vendors/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_my_commissions(params?: { status?: any }): Promise<any> {
    const url = `/marketer/commissions/my`;
    const config = { params };

    return axios.get(url, config);
  }

  async marketer_controller_get_commission_statistics(): Promise<any> {
    const url = `/marketer/commissions/statistics`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_pending_commissions(): Promise<any> {
    const url = `/marketer/commissions/pending`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_overview(): Promise<any> {
    const url = `/marketer/overview`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_today_statistics(): Promise<any> {
    const url = `/marketer/statistics/today`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_month_statistics(): Promise<any> {
    const url = `/marketer/statistics/month`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_earnings(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/marketer/earnings`;
    const config = { params };

    return axios.get(url, config);
  }

  async marketer_controller_get_earnings_breakdown(): Promise<any> {
    const url = `/marketer/earnings/breakdown`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_upload_file(data?: any): Promise<any> {
    const url = `/marketer/files/upload`;
    const config = {};

    return axios.post(url, data, config);
  }

  async marketer_controller_get_files(): Promise<any> {
    const url = `/marketer/files`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_get_notifications(): Promise<any> {
    const url = `/marketer/notifications`;
    const config = {};

    return axios.get(url, config);
  }

  async marketer_controller_mark_notification_read(id: string, data?: any): Promise<any> {
    const url = `/marketer/notifications/${id}/read`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async marketer_controller_get_territory_stats(): Promise<any> {
    const url = `/marketer/territory/stats`;
    const config = {};

    return axios.get(url, config);
  }
}