import axios from 'axios';

export class OrderApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async order_controller_get_my_orders_short(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/order`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_controller_create_order(data?: any): Promise<any> {
    const url = `/delivery/order`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_get_user_orders(userId: string, params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/order/user/${userId}`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_controller_get_my_orders(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/order/my-orders`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_controller_get_order(id: string): Promise<any> {
    const url = `/delivery/order/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_assign_driver(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/assign-driver`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_add_note(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/notes`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_get_notes(id: string): Promise<any> {
    const url = `/delivery/order/${id}/notes`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_get_vendor_orders(params?: { cursor?: any, limit?: any }): Promise<any> {
    const url = `/delivery/order/vendor/orders`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_controller_vendor_accept_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/vendor-accept`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_vendor_cancel_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/vendor-cancel`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_set_proof_of_delivery(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/pod`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_get_proof_of_delivery(id: string): Promise<any> {
    const url = `/delivery/order/${id}/pod`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_cancel_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/cancel`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_return_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/return`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_rate_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/rate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_repeat_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/repeat`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_admin_change_status(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/admin-status`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async order_controller_export_orders(params?: { startDate?: any, endDate?: any, status?: any }): Promise<any> {
    const url = `/delivery/order/export`;
    const config = { params };

    return axios.get(url, config);
  }

  async order_controller_track_order(id: string): Promise<any> {
    const url = `/delivery/order/${id}/tracking`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_schedule_order(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/schedule`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_get_public_order_status(id: string): Promise<any> {
    const url = `/delivery/order/public/${id}/status`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_get_live_tracking(id: string): Promise<any> {
    const url = `/delivery/order/${id}/live-tracking`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_get_driver_e_t_a(id: string): Promise<any> {
    const url = `/delivery/order/${id}/driver-eta`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_update_driver_location(id: string, data?: any): Promise<any> {
    const url = `/delivery/order/${id}/update-location`;
    const config = {};

    return axios.post(url, data, config);
  }

  async order_controller_get_route_history(id: string): Promise<any> {
    const url = `/delivery/order/${id}/route-history`;
    const config = {};

    return axios.get(url, config);
  }

  async order_controller_get_delivery_timeline(id: string): Promise<any> {
    const url = `/delivery/order/${id}/delivery-timeline`;
    const config = {};

    return axios.get(url, config);
  }
}