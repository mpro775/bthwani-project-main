import axios from 'axios';

export class AuthApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async auth_controller_login_with_firebase(data?: any): Promise<any> {
    const url = `/auth/firebase/login`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_grant_consent(data?: any): Promise<any> {
    const url = `/auth/consent`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_grant_bulk_consents(data?: any): Promise<any> {
    const url = `/auth/consent/bulk`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_withdraw_consent(type: string): Promise<any> {
    const url = `/auth/consent/${type}`;
    const config = {};

    return axios.delete(url, config);
  }

  async auth_controller_get_consent_history(params?: { type?: any }): Promise<any> {
    const url = `/auth/consent/history`;
    const config = { params };

    return axios.get(url, config);
  }

  async auth_controller_get_consent_summary(): Promise<any> {
    const url = `/auth/consent/summary`;
    const config = {};

    return axios.get(url, config);
  }

  async auth_controller_check_consent(type: string): Promise<any> {
    const url = `/auth/consent/check/${type}`;
    const config = {};

    return axios.get(url, config);
  }

  async auth_controller_forgot_password(data?: any): Promise<any> {
    const url = `/auth/forgot`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_verify_reset_code(data?: any): Promise<any> {
    const url = `/auth/reset/verify`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_reset_password(data?: any): Promise<any> {
    const url = `/auth/reset`;
    const config = {};

    return axios.post(url, data, config);
  }

  async auth_controller_verify_otp(data?: any): Promise<any> {
    const url = `/auth/verify-otp`;
    const config = {};

    return axios.post(url, data, config);
  }
}