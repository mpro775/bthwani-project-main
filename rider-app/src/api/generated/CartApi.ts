import axios from 'axios';

export class CartApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async cart_controller_get_my_cart(): Promise<any> {
    const url = `/delivery/cart`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_clear_cart(): Promise<any> {
    const url = `/delivery/cart`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_get_user_cart(userId: string): Promise<any> {
    const url = `/delivery/cart/user/${userId}`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_get_cart_by_id(cartId: string): Promise<any> {
    const url = `/delivery/cart/${cartId}`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_delete_cart_item(id: string): Promise<any> {
    const url = `/delivery/cart/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_add_to_cart(data?: any): Promise<any> {
    const url = `/delivery/cart/items`;
    const config = {};

    return axios.post(url, data, config);
  }

  async cart_controller_add_to_cart_compat(data?: any): Promise<any> {
    const url = `/delivery/cart/add`;
    const config = {};

    return axios.post(url, data, config);
  }

  async cart_controller_update_cart_item(productId: string, data?: any): Promise<any> {
    const url = `/delivery/cart/items/${productId}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_remove_from_cart(productId: string): Promise<any> {
    const url = `/delivery/cart/items/${productId}`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_update_cart_item_compat(productId: string, data?: any): Promise<any> {
    const url = `/delivery/cart/${productId}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_remove_from_cart_compat(productId: string): Promise<any> {
    const url = `/delivery/cart/${productId}`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_add_note(data?: any): Promise<any> {
    const url = `/delivery/cart/note`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_add_delivery_address(data?: any): Promise<any> {
    const url = `/delivery/cart/delivery-address`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_get_cart_count(): Promise<any> {
    const url = `/delivery/cart/count`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_get_cart_fee(): Promise<any> {
    const url = `/delivery/cart/fee`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_merge_cart(data?: any): Promise<any> {
    const url = `/delivery/cart/merge`;
    const config = {};

    return axios.post(url, data, config);
  }

  async cart_controller_get_my_shein_cart(): Promise<any> {
    const url = `/delivery/cart/shein`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_clear_shein_cart(): Promise<any> {
    const url = `/delivery/cart/shein`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_add_to_shein_cart(data?: any): Promise<any> {
    const url = `/delivery/cart/shein/items`;
    const config = {};

    return axios.post(url, data, config);
  }

  async cart_controller_update_shein_cart_item(sheinProductId: string, data?: any): Promise<any> {
    const url = `/delivery/cart/shein/items/${sheinProductId}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_remove_from_shein_cart(sheinProductId: string): Promise<any> {
    const url = `/delivery/cart/shein/items/${sheinProductId}`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_update_shein_shipping(data?: any): Promise<any> {
    const url = `/delivery/cart/shein/shipping`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_add_shein_note(data?: any): Promise<any> {
    const url = `/delivery/cart/shein/note`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async cart_controller_get_combined_cart(): Promise<any> {
    const url = `/delivery/cart/combined`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_clear_all_carts(): Promise<any> {
    const url = `/delivery/cart/combined/clear-all`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_get_abandoned_carts(): Promise<any> {
    const url = `/delivery/cart/abandoned`;
    const config = {};

    return axios.get(url, config);
  }

  async cart_controller_delete_specific_cart_item(cartId: string, productId: string): Promise<any> {
    const url = `/delivery/cart/${cartId}/items/${productId}`;
    const config = {};

    return axios.delete(url, config);
  }

  async cart_controller_send_retarget_notification(cartId: string, data?: any): Promise<any> {
    const url = `/delivery/cart/${cartId}/retarget/push`;
    const config = {};

    return axios.post(url, data, config);
  }
}