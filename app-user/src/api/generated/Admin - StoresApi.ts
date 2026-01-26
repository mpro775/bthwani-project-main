import axios from 'axios';

export class Admin - StoresApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async store_controller_create_store(data?: any): Promise<any> {
    const url = `/admin/stores`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_find_stores(params?: { cursor?: any, limit?: any, isActive?: any, usageType?: any, q?: any }): Promise<any> {
    const url = `/admin/stores`;
    const config = { params };

    return axios.get(url, config);
  }

  async store_controller_find_store(id: string): Promise<any> {
    const url = `/admin/stores/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async store_controller_update_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async store_controller_delete_store(id: string): Promise<any> {
    const url = `/admin/stores/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async store_controller_create_product(data?: any): Promise<any> {
    const url = `/admin/stores/products`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_get_products(id: string, params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/admin/stores/${id}/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async store_controller_activate_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/activate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_deactivate_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/deactivate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_force_close_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/force-close`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_force_open_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/force-open`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_update_product(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/products/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async store_controller_get_store_analytics(id: string, params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/stores/${id}/analytics`;
    const config = { params };

    return axios.get(url, config);
  }

  async store_controller_get_product_variants(id: string): Promise<any> {
    const url = `/admin/stores/products/${id}/variants`;
    const config = {};

    return axios.get(url, config);
  }

  async store_controller_add_product_variant(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/products/${id}/variants`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_get_store_inventory(id: string): Promise<any> {
    const url = `/admin/stores/${id}/inventory`;
    const config = {};

    return axios.get(url, config);
  }

  async store_controller_get_pending_stores(): Promise<any> {
    const url = `/admin/stores/pending`;
    const config = {};

    return axios.get(url, config);
  }

  async store_controller_approve_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/approve`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_reject_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/reject`;
    const config = {};

    return axios.post(url, data, config);
  }

  async store_controller_suspend_store(id: string, data?: any): Promise<any> {
    const url = `/admin/stores/${id}/suspend`;
    const config = {};

    return axios.post(url, data, config);
  }
}