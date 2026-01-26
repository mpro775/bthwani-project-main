import axios from 'axios';

export class Orders (CQRS)Api {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async order_cqrs_controller_create(data?: any): Promise<any> {
    const url = `/orders-cqrs`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_cqrs_controller_find_user_orders(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/orders-cqrs`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_cqrs_controller_update_status(id: string, data?: any): Promise<any> {
    const url = `/orders-cqrs/${id}/status`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async order_cqrs_controller_assign_driver(id: string, data?: any): Promise<any> {
    const url = `/orders-cqrs/${id}/assign-driver`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_cqrs_controller_cancel(id: string, data?: any): Promise<any> {
    const url = `/orders-cqrs/${id}/cancel`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_cqrs_controller_find_one(id: string): Promise<any> {
    const url = `/orders-cqrs/${id}`;
    const config = {};

    return axios.get(url, config);
  }
}