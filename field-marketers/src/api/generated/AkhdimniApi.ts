import axios from 'axios';

export class AkhdimniApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async akhdimni_controller_calculate_fee(data?: any): Promise<any> {
    const url = `/akhdimni/errands/calculate-fee`;
    const config = {};

    return axios.post(url, data, config);
  }

  async akhdimni_controller_create_errand(data?: any): Promise<any> {
    const url = `/akhdimni/errands`;
    const config = {};

    return axios.post(url, data, config);
  }

  async akhdimni_controller_get_my_errands(params?: { status?: any }): Promise<any> {
    const url = `/akhdimni/my-errands`;
    const config = { params };

    return axios.get(url, config);
  }

  async akhdimni_controller_get_errand(id: string): Promise<any> {
    const url = `/akhdimni/errands/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async akhdimni_controller_cancel_errand(id: string, data?: any): Promise<any> {
    const url = `/akhdimni/errands/${id}/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async akhdimni_controller_rate_errand(id: string, data?: any): Promise<any> {
    const url = `/akhdimni/errands/${id}/rate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async akhdimni_controller_get_my_driver_errands(params?: { status?: any }): Promise<any> {
    const url = `/akhdimni/driver/my-errands`;
    const config = { params };

    return axios.get(url, config);
  }

  async akhdimni_controller_update_errand_status(id: string, data?: any): Promise<any> {
    const url = `/akhdimni/errands/${id}/status`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async akhdimni_controller_get_all_errands(params?: { status?: any, limit?: any, cursor?: any }): Promise<any> {
    const url = `/akhdimni/admin/errands`;
    const config = { params };

    return axios.get(url, config);
  }

  async akhdimni_controller_assign_driver(id: string, data?: any): Promise<any> {
    const url = `/akhdimni/admin/errands/${id}/assign-driver`;
    const config = {};

    return axios.post(url, data, config);
  }
}