import axios from 'axios';

export class DriverApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async driver_controller_create(data?: any): Promise<any> {
    const url = `/drivers`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_find_available(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/drivers/available`;
    const config = { params };

    return axios.get(url, config);
  }

  async driver_controller_find_one(id: string): Promise<any> {
    const url = `/drivers/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_update_location(data?: any): Promise<any> {
    const url = `/drivers/location`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async driver_controller_update_availability(data?: any): Promise<any> {
    const url = `/drivers/availability`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async driver_controller_get_profile(): Promise<any> {
    const url = `/drivers/profile`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_update_profile(data?: any): Promise<any> {
    const url = `/drivers/profile`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async driver_controller_get_earnings(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/drivers/earnings`;
    const config = { params };

    return axios.get(url, config);
  }

  async driver_controller_get_daily_earnings(): Promise<any> {
    const url = `/drivers/earnings/daily`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_get_weekly_earnings(): Promise<any> {
    const url = `/drivers/earnings/weekly`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_get_statistics(): Promise<any> {
    const url = `/drivers/statistics`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_upload_document(data?: any): Promise<any> {
    const url = `/drivers/documents/upload`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_get_documents(): Promise<any> {
    const url = `/drivers/documents`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_get_driver_documents_admin(driverId: string): Promise<any> {
    const url = `/drivers/${driverId}/documents`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_verify_document(driverId: string, docId: string, data?: any): Promise<any> {
    const url = `/drivers/${driverId}/documents/${docId}/verify`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_request_vacation(data?: any): Promise<any> {
    const url = `/drivers/vacations/request`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_get_my_vacations(): Promise<any> {
    const url = `/drivers/vacations/my`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_cancel_vacation(id: string, data?: any): Promise<any> {
    const url = `/drivers/vacations/${id}/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async driver_controller_get_vacation_balance(): Promise<any> {
    const url = `/drivers/vacations/balance`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_get_vacation_policy(): Promise<any> {
    const url = `/drivers/vacations/policy`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_get_available_orders(): Promise<any> {
    const url = `/drivers/orders/available`;
    const config = {};

    return axios.get(url, config);
  }

  async driver_controller_accept_order(id: string, data?: any): Promise<any> {
    const url = `/drivers/orders/${id}/accept`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_reject_order(id: string, data?: any): Promise<any> {
    const url = `/drivers/orders/${id}/reject`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_start_delivery(id: string, data?: any): Promise<any> {
    const url = `/drivers/orders/${id}/start-delivery`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_complete_delivery(id: string, data?: any): Promise<any> {
    const url = `/drivers/orders/${id}/complete`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_get_orders_history(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/drivers/orders/history`;
    const config = { params };

    return axios.get(url, config);
  }

  async driver_controller_report_issue(data?: any): Promise<any> {
    const url = `/drivers/issues/report`;
    const config = {};

    return axios.post(url, data, config);
  }

  async driver_controller_change_password(data?: any): Promise<any> {
    const url = `/drivers/change-password`;
    const config = {};

    return axios.post(url, data, config);
  }
}