import axios from 'axios';

export class HealthApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async health_controller_check(): Promise<any> {
    const url = `/health`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_liveness(): Promise<any> {
    const url = `/health/liveness`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_readiness(): Promise<any> {
    const url = `/health/readiness`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_advanced(): Promise<any> {
    const url = `/health/advanced`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_startup(): Promise<any> {
    const url = `/health/startup`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_detailed(): Promise<any> {
    const url = `/health/detailed`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_metrics(): Promise<any> {
    const url = `/health/metrics`;
    const config = {};

    return axios.get(url, config);
  }

  async health_controller_info(): Promise<any> {
    const url = `/health/info`;
    const config = {};

    return axios.get(url, config);
  }
}