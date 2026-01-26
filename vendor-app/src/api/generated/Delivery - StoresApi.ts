import axios from 'axios';

export class Delivery - StoresApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async delivery_store_controller_find_stores(params?: { cursor?: any, limit?: any, categoryId?: any, isTrending?: any, isFeatured?: any, usageType?: any }): Promise<any> {
    const url = `/delivery/stores`;
    const config = { params };

    return axios.get(url, config);
  }

  async delivery_store_controller_search_stores(params?: { q?: any, cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/stores/search`;
    const config = { params };

    return axios.get(url, config);
  }

  async delivery_store_controller_find_store(id: string): Promise<any> {
    const url = `/delivery/stores/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async delivery_store_controller_update_store(id: string, data?: any): Promise<any> {
    const url = `/delivery/stores/${id}`;
    const config = {};

    return axios.put(url, data, config);
  }

  async delivery_store_controller_get_products(id: string, params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/stores/${id}/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async delivery_store_controller_get_store_statistics(id: string): Promise<any> {
    const url = `/delivery/stores/${id}/statistics`;
    const config = {};

    return axios.get(url, config);
  }

  async delivery_store_controller_get_store_reviews(id: string, params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/stores/${id}/reviews`;
    const config = { params };

    return axios.get(url, config);
  }
}