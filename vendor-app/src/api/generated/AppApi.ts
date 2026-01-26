import axios from 'axios';

export class AppApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async app_controller_get_hello(): Promise<any> {
    const url = `/`;
    const config = {};

    return axios.get(url, config);
  }
}