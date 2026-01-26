import axios from 'axios';

export class Admin CMSApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async admin_c_m_s_controller_create_onboarding_slide(data?: any): Promise<any> {
    const url = `/admin/onboarding-slides`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_c_m_s_controller_update_onboarding_slide(id: string, data?: any): Promise<any> {
    const url = `/admin/onboarding-slides/${id}`;
    const config = {};

    return axios.put(url, data, config);
  }

  async admin_c_m_s_controller_delete_onboarding_slide(id: string): Promise<any> {
    const url = `/admin/onboarding-slides/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_update_page(id: string, data?: any): Promise<any> {
    const url = `/admin/pages/${id}`;
    const config = {};

    return axios.put(url, data, config);
  }

  async admin_c_m_s_controller_delete_page(id: string): Promise<any> {
    const url = `/admin/pages/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_create_string(data?: any): Promise<any> {
    const url = `/admin/strings`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_c_m_s_controller_update_string(id: string, data?: any): Promise<any> {
    const url = `/admin/strings/${id}`;
    const config = {};

    return axios.put(url, data, config);
  }

  async admin_c_m_s_controller_delete_string(id: string): Promise<any> {
    const url = `/admin/strings/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_create_home_layout(data?: any): Promise<any> {
    const url = `/admin/home-layouts`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_c_m_s_controller_update_home_layout(id: string, data?: any): Promise<any> {
    const url = `/admin/home-layouts/${id}`;
    const config = {};

    return axios.put(url, data, config);
  }

  async admin_c_m_s_controller_delete_home_layout(id: string): Promise<any> {
    const url = `/admin/home-layouts/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_delete_coupon(id: string): Promise<any> {
    const url = `/admin/wallet/coupons/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_delete_subscription(id: string): Promise<any> {
    const url = `/admin/wallet/subscriptions/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_c_m_s_controller_generate_report(data?: any): Promise<any> {
    const url = `/admin/reports/generate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_c_m_s_controller_export_report(id: string, format: string, data?: any): Promise<any> {
    const url = `/admin/reports/export/${id}/${format}`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_c_m_s_controller_get_realtime_reports(): Promise<any> {
    const url = `/admin/reports/realtime`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_c_m_s_controller_export_settlements(): Promise<any> {
    const url = `/admin/wallet/settlements/export`;
    const config = {};

    return axios.get(url, config);
  }
}