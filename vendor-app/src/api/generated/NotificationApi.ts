import axios from 'axios';

export class NotificationApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async notification_controller_create(data?: any): Promise<any> {
    const url = `/notifications`;
    const config = {};

    return axios.post(url, data, config);
  }

  async notification_controller_get_my_notifications(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/notifications/my`;
    const config = { params };

    return axios.get(url, config);
  }

  async notification_controller_mark_as_read(id: string, data?: any): Promise<any> {
    const url = `/notifications/${id}/read`;
    const config = {};

    return axios.post(url, data, config);
  }

  async notification_controller_get_unread_count(): Promise<any> {
    const url = `/notifications/unread/count`;
    const config = {};

    return axios.get(url, config);
  }

  async notification_controller_mark_all_as_read(data?: any): Promise<any> {
    const url = `/notifications/read-all`;
    const config = {};

    return axios.post(url, data, config);
  }

  async notification_controller_delete(id: string): Promise<any> {
    const url = `/notifications/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async notification_controller_create_suppression(data?: any): Promise<any> {
    const url = `/notifications/suppression`;
    const config = {};

    return axios.post(url, data, config);
  }

  async notification_controller_get_user_suppressions(): Promise<any> {
    const url = `/notifications/suppression`;
    const config = {};

    return axios.get(url, config);
  }

  async notification_controller_get_suppressed_channels(): Promise<any> {
    const url = `/notifications/suppression/channels`;
    const config = {};

    return axios.get(url, config);
  }

  async notification_controller_remove_suppression(id: string): Promise<any> {
    const url = `/notifications/suppression/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async notification_controller_remove_channel_suppression(channel: string): Promise<any> {
    const url = `/notifications/suppression/channel/${channel}`;
    const config = {};

    return axios.delete(url, config);
  }

  async notification_controller_get_suppression_stats(): Promise<any> {
    const url = `/notifications/suppression/stats`;
    const config = {};

    return axios.get(url, config);
  }

  async notification_controller_send_bulk_notification(data?: any): Promise<any> {
    const url = `/notifications/send-bulk`;
    const config = {};

    return axios.post(url, data, config);
  }
}