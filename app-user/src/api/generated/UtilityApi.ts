import axios from 'axios';

export class UtilityApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async utility_controller_get_utility_options(params?: { city?: any }): Promise<any> {
    const url = `/utility/options`;
    const config = { params };

    return axios.get(url, config);
  }

  async utility_controller_calculate_price(data?: any): Promise<any> {
    const url = `/utility/calculate-price`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_create_pricing(data?: any): Promise<any> {
    const url = `/utility/pricing`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_get_all_pricing(): Promise<any> {
    const url = `/utility/pricing`;
    const config = {};

    return axios.get(url, config);
  }

  async utility_controller_get_pricing_by_city(city: string): Promise<any> {
    const url = `/utility/pricing/${city}`;
    const config = {};

    return axios.get(url, config);
  }

  async utility_controller_update_pricing(city: string, data?: any): Promise<any> {
    const url = `/utility/pricing/${city}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async utility_controller_delete_pricing(city: string): Promise<any> {
    const url = `/utility/pricing/${city}`;
    const config = {};

    return axios.delete(url, config);
  }

  async utility_controller_upsert_gas(data?: any): Promise<any> {
    const url = `/utility/options/gas`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async utility_controller_upsert_water(data?: any): Promise<any> {
    const url = `/utility/options/water`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async utility_controller_list_daily(params?: { kind?: any, city?: any }): Promise<any> {
    const url = `/utility/daily`;
    const config = { params };

    return axios.get(url, config);
  }

  async utility_controller_upsert_daily(data?: any): Promise<any> {
    const url = `/utility/daily`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_delete_daily_by_key(params?: { kind?: any, city?: any, date?: any, variant?: any }): Promise<any> {
    const url = `/utility/daily`;
    const config = { params };

    return axios.delete(url, config);
  }

  async utility_controller_delete_daily(id: string): Promise<any> {
    const url = `/utility/daily/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async utility_controller_create_order(data?: any): Promise<any> {
    const url = `/utility/order`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_get_user_orders(): Promise<any> {
    const url = `/utility/orders`;
    const config = {};

    return axios.get(url, config);
  }

  async utility_controller_get_order(id: string): Promise<any> {
    const url = `/utility/order/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async utility_controller_update_order_status(id: string, data?: any): Promise<any> {
    const url = `/utility/order/${id}/status`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async utility_controller_cancel_order(id: string, data?: any): Promise<any> {
    const url = `/utility/order/${id}/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async utility_controller_rate_order(id: string, data?: any): Promise<any> {
    const url = `/utility/order/${id}/rate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_assign_driver(id: string, data?: any): Promise<any> {
    const url = `/utility/order/${id}/assign-driver`;
    const config = {};

    return axios.post(url, data, config);
  }

  async utility_controller_get_all_orders(params?: { limit?: any, cursor?: any }): Promise<any> {
    const url = `/utility/admin/orders`;
    const config = { params };

    return axios.get(url, config);
  }
}