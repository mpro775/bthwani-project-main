import axios from 'axios';

export class WalletApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async wallet_controller_get_balance(): Promise<any> {
    const url = `/wallet/balance`;
    const config = {};

    return axios.get(url, config);
  }

  async wallet_controller_get_transactions(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/wallet/transactions`;
    const config = { params };

    return axios.get(url, config);
  }

  async wallet_controller_create_transaction(data?: any): Promise<any> {
    const url = `/wallet/transaction`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_hold_funds(data?: any): Promise<any> {
    const url = `/wallet/hold`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_release_funds(data?: any): Promise<any> {
    const url = `/wallet/release`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_refund_funds(data?: any): Promise<any> {
    const url = `/wallet/refund`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_topup_via_kuraimi(data?: any): Promise<any> {
    const url = `/wallet/topup/kuraimi`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_verify_topup(data?: any): Promise<any> {
    const url = `/wallet/topup/verify`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_get_topup_history(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/wallet/topup/history`;
    const config = { params };

    return axios.get(url, config);
  }

  async wallet_controller_get_topup_methods(): Promise<any> {
    const url = `/wallet/topup/methods`;
    const config = {};

    return axios.get(url, config);
  }

  async wallet_controller_request_withdrawal(data?: any): Promise<any> {
    const url = `/wallet/withdraw/request`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_get_my_withdrawals(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/wallet/withdraw/my`;
    const config = { params };

    return axios.get(url, config);
  }

  async wallet_controller_cancel_withdrawal(id: string, data?: any): Promise<any> {
    const url = `/wallet/withdraw/${id}/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async wallet_controller_get_withdraw_methods(): Promise<any> {
    const url = `/wallet/withdraw/methods`;
    const config = {};

    return axios.get(url, config);
  }

  async wallet_controller_pay_bill(data?: any): Promise<any> {
    const url = `/wallet/pay-bill`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_get_bills(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/wallet/bills`;
    const config = { params };

    return axios.get(url, config);
  }

  async wallet_controller_transfer_funds(data?: any): Promise<any> {
    const url = `/wallet/transfer`;
    const config = {};

    return axios.post(url, data, config);
  }

  async wallet_controller_get_transfers(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/wallet/transfers`;
    const config = { params };

    return axios.get(url, config);
  }

  async wallet_controller_get_transaction_details(id: string): Promise<any> {
    const url = `/wallet/transaction/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async wallet_controller_request_refund(data?: any): Promise<any> {
    const url = `/wallet/refund/request`;
    const config = {};

    return axios.post(url, data, config);
  }
}