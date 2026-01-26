import axios from 'axios';

export class UserApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async user_controller_get_current_user(): Promise<any> {
    const url = `/users/me`;
    const config = {};

    return axios.get(url, config);
  }

  async user_controller_update_profile(data?: any): Promise<any> {
    const url = `/users/me`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async user_controller_get_addresses(): Promise<any> {
    const url = `/users/addresses`;
    const config = {};

    return axios.get(url, config);
  }

  async user_controller_add_address(data?: any): Promise<any> {
    const url = `/users/addresses`;
    const config = {};

    return axios.post(url, data, config);
  }

  async user_controller_update_address(addressId: string, data?: any): Promise<any> {
    const url = `/users/addresses/${addressId}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async user_controller_delete_address(addressId: string): Promise<any> {
    const url = `/users/addresses/${addressId}`;
    const config = {};

    return axios.delete(url, config);
  }

  async user_controller_set_default_address(addressId: string, data?: any): Promise<any> {
    const url = `/users/addresses/${addressId}/set-default`;
    const config = {};

    return axios.post(url, data, config);
  }

  async user_controller_update_address_alias(id: string, data?: any): Promise<any> {
    const url = `/users/address/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async user_controller_delete_address_alias(id: string): Promise<any> {
    const url = `/users/address/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async user_controller_set_default_address_alias(data?: any): Promise<any> {
    const url = `/users/default-address`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async user_controller_deactivate_account(): Promise<any> {
    const url = `/users/deactivate`;
    const config = {};

    return axios.delete(url, config);
  }

  async user_controller_search_users(params?: { q?: any, cursor?: any, limit?: any }): Promise<any> {
    const url = `/users/search`;
    const config = { params };

    return axios.get(url, config);
  }

  async user_controller_set_pin(data?: any): Promise<any> {
    const url = `/users/pin/set`;
    const config = {};

    return axios.post(url, data, config);
  }

  async user_controller_verify_pin(data?: any): Promise<any> {
    const url = `/users/pin/verify`;
    const config = {};

    return axios.post(url, data, config);
  }

  async user_controller_change_pin(data?: any): Promise<any> {
    const url = `/users/pin/change`;
    const config = {};

    return axios.post(url, data, config);
  }

  async user_controller_get_pin_status(): Promise<any> {
    const url = `/users/pin/status`;
    const config = {};

    return axios.get(url, config);
  }

  async user_controller_reset_pin(userId: string): Promise<any> {
    const url = `/users/pin/reset/${userId}`;
    const config = {};

    return axios.delete(url, config);
  }
}