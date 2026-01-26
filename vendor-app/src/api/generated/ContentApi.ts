import axios from 'axios';

export class ContentApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async content_controller_get_active_banners(params?: { placement?: any }): Promise<any> {
    const url = `/content/banners`;
    const config = { params };

    return axios.get(url, config);
  }

  async content_controller_create_banner(data?: any): Promise<any> {
    const url = `/content/banners`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_record_banner_click(id: string, data?: any): Promise<any> {
    const url = `/content/banners/${id}/click`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_get_all_banners(): Promise<any> {
    const url = `/content/admin/banners`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_update_banner(id: string, data?: any): Promise<any> {
    const url = `/content/banners/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_delete_banner(id: string): Promise<any> {
    const url = `/content/banners/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async content_controller_get_store_sections(storeId: string): Promise<any> {
    const url = `/content/stores/${storeId}/sections`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_create_store_section(data?: any): Promise<any> {
    const url = `/content/sections`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_update_store_section(id: string, data?: any): Promise<any> {
    const url = `/content/sections/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_delete_store_section(id: string): Promise<any> {
    const url = `/content/sections/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async content_controller_get_subscription_plans(): Promise<any> {
    const url = `/content/subscription-plans`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_create_subscription_plan(data?: any): Promise<any> {
    const url = `/content/subscription-plans`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_subscribe(data?: any): Promise<any> {
    const url = `/content/subscribe`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_get_my_subscription(): Promise<any> {
    const url = `/content/my-subscription`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_cancel_subscription(data?: any): Promise<any> {
    const url = `/content/my-subscription/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_get_c_m_s_pages(params?: { type?: any }): Promise<any> {
    const url = `/content/pages`;
    const config = { params };

    return axios.get(url, config);
  }

  async content_controller_get_c_m_s_page_by_slug(slug: string): Promise<any> {
    const url = `/content/pages/${slug}`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_create_c_m_s_page(data?: any): Promise<any> {
    const url = `/content/admin/pages`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_update_c_m_s_page(id: string, data?: any): Promise<any> {
    const url = `/content/admin/pages/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_get_app_settings(): Promise<any> {
    const url = `/content/app-settings`;
    const config = {};

    return axios.get(url, config);
  }

  async content_controller_update_app_settings(data?: any): Promise<any> {
    const url = `/content/admin/app-settings`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_get_f_a_qs(params?: { category?: any }): Promise<any> {
    const url = `/content/faqs`;
    const config = { params };

    return axios.get(url, config);
  }

  async content_controller_create_f_a_q(data?: any): Promise<any> {
    const url = `/content/admin/faqs`;
    const config = {};

    return axios.post(url, data, config);
  }

  async content_controller_update_f_a_q(id: string, data?: any): Promise<any> {
    const url = `/content/admin/faqs/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async content_controller_delete_f_a_q(id: string): Promise<any> {
    const url = `/content/admin/faqs/${id}`;
    const config = {};

    return axios.delete(url, config);
  }
}