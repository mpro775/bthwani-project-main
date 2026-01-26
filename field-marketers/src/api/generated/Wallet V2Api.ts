import axios from 'axios';

export class Wallet V2Api {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async v2_wallet_controller_apply_coupon(data?: any): Promise<any> {
    const url = `/v2/wallet/coupons/apply`;
    const config = {};

    return axios.post(url, data, config);
  }

  async v2_wallet_controller_get_my_coupons(): Promise<any> {
    const url = `/v2/wallet/coupons/my`;
    const config = {};

    return axios.get(url, config);
  }

  async v2_wallet_controller_get_coupons_history(): Promise<any> {
    const url = `/v2/wallet/coupons/history`;
    const config = {};

    return axios.get(url, config);
  }

  async v2_wallet_controller_get_my_subscriptions(): Promise<any> {
    const url = `/v2/wallet/subscriptions/my`;
    const config = {};

    return axios.get(url, config);
  }
}