import axios from 'axios';

export class VendorApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async vendor_controller_create(data?: any): Promise<any> {
    const url = `/vendors`;
    const config = {};

    return axios.post(url, data, config);
  }

  async vendor_controller_find_all(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/vendors`;
    const config = { params };

    return axios.get(url, config);
  }

  async vendor_controller_get_profile(): Promise<any> {
    const url = `/vendors/me`;
    const config = {};

    return axios.get(url, config);
  }

  async vendor_controller_update(data?: any): Promise<any> {
    const url = `/vendors/me`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async vendor_controller_find_one(id: string): Promise<any> {
    const url = `/vendors/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async vendor_controller_update_vendor(id: string, data?: any): Promise<any> {
    const url = `/vendors/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async vendor_controller_update_status(id: string, data?: any): Promise<any> {
    const url = `/vendors/${id}/status`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async vendor_controller_reset_password(id: string, data?: any): Promise<any> {
    const url = `/vendors/${id}/reset-password`;
    const config = {};

    return axios.post(url, data, config);
  }

  async vendor_controller_get_dashboard(): Promise<any> {
    const url = `/vendors/dashboard/overview`;
    const config = {};

    return axios.get(url, config);
  }

  async vendor_controller_get_account_statement(): Promise<any> {
    const url = `/vendors/account/statement`;
    const config = {};

    return axios.get(url, config);
  }

  async vendor_controller_get_settlements(): Promise<any> {
    const url = `/vendors/settlements`;
    const config = {};

    return axios.get(url, config);
  }

  async vendor_controller_create_settlement(data?: any): Promise<any> {
    const url = `/vendors/settlements`;
    const config = {};

    return axios.post(url, data, config);
  }

  async vendor_controller_get_sales(params?: { limit?: any }): Promise<any> {
    const url = `/vendors/sales`;
    const config = { params };

    return axios.get(url, config);
  }

  async vendor_controller_request_account_deletion(data?: any): Promise<any> {
    const url = `/vendors/account/delete-request`;
    const config = {};

    return axios.post(url, data, config);
  }
}