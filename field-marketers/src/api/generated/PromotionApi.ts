import axios from 'axios';

export class PromotionApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async promotion_controller_get_promotions_by_placement(params?: { channel?: any, city?: any, placement?: any }): Promise<any> {
    const url = `/promotions/by-placement`;
    const config = { params };

    return axios.get(url, config);
  }

  async promotion_controller_record_click(id: string, data?: any): Promise<any> {
    const url = `/promotions/${id}/click`;
    const config = {};

    return axios.post(url, data, config);
  }

  async promotion_controller_record_conversion(id: string, data?: any): Promise<any> {
    const url = `/promotions/${id}/conversion`;
    const config = {};

    return axios.post(url, data, config);
  }

  async promotion_controller_create_promotion(data?: any): Promise<any> {
    const url = `/promotions`;
    const config = {};

    return axios.post(url, data, config);
  }

  async promotion_controller_get_all_promotions(params?: { isActive?: any }): Promise<any> {
    const url = `/promotions`;
    const config = { params };

    return axios.get(url, config);
  }

  async promotion_controller_get_promotion(id: string): Promise<any> {
    const url = `/promotions/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async promotion_controller_update_promotion(id: string, data?: any): Promise<any> {
    const url = `/promotions/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async promotion_controller_delete_promotion(id: string): Promise<any> {
    const url = `/promotions/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async promotion_controller_get_statistics(): Promise<any> {
    const url = `/promotions/stats/overview`;
    const config = {};

    return axios.get(url, config);
  }
}