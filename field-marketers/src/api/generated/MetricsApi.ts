import axios from 'axios';

export class MetricsApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async metrics_controller_get_prometheus_metrics(): Promise<any> {
    const url = `/metrics`;
    const config = {};

    return axios.get(url, config);
  }

  async metrics_controller_get_json_metrics(): Promise<any> {
    const url = `/metrics/json`;
    const config = {};

    return axios.get(url, config);
  }
}