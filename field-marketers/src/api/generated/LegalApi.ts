import axios from 'axios';

export class LegalApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async legal_controller_get_privacy_policy(params?: { lang?: any }): Promise<any> {
    const url = `/legal/privacy-policy`;
    const config = { params };

    return axios.get(url, config);
  }

  async legal_controller_get_terms_of_service(params?: { lang?: any }): Promise<any> {
    const url = `/legal/terms-of-service`;
    const config = { params };

    return axios.get(url, config);
  }

  async legal_controller_record_consent(data?: any): Promise<any> {
    const url = `/legal/consent`;
    const config = {};

    return axios.post(url, data, config);
  }

  async legal_controller_get_my_consents(): Promise<any> {
    const url = `/legal/consent/my`;
    const config = {};

    return axios.get(url, config);
  }

  async legal_controller_check_consent(type: string): Promise<any> {
    const url = `/legal/consent/check/${type}`;
    const config = {};

    return axios.get(url, config);
  }

  async legal_controller_get_all_privacy_policies(): Promise<any> {
    const url = `/legal/admin/privacy-policies`;
    const config = {};

    return axios.get(url, config);
  }

  async legal_controller_create_privacy_policy(data?: any): Promise<any> {
    const url = `/legal/admin/privacy-policy`;
    const config = {};

    return axios.post(url, data, config);
  }

  async legal_controller_activate_privacy_policy(id: string, data?: any): Promise<any> {
    const url = `/legal/admin/privacy-policy/${id}/activate`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async legal_controller_get_all_terms_of_service(): Promise<any> {
    const url = `/legal/admin/terms-of-service`;
    const config = {};

    return axios.get(url, config);
  }

  async legal_controller_create_terms_of_service(data?: any): Promise<any> {
    const url = `/legal/admin/terms-of-service`;
    const config = {};

    return axios.post(url, data, config);
  }

  async legal_controller_activate_terms_of_service(id: string, data?: any): Promise<any> {
    const url = `/legal/admin/terms-of-service/${id}/activate`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async legal_controller_get_consent_statistics(): Promise<any> {
    const url = `/legal/admin/consent/statistics`;
    const config = {};

    return axios.get(url, config);
  }
}