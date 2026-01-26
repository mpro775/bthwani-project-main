import axios from 'axios';

export class MerchantApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async merchant_controller_create_merchant(data?: any): Promise<any> {
    const url = `/merchants`;
    const config = {};

    return axios.post(url, data, config);
  }

  async merchant_controller_get_all_merchants(params?: { isActive?: any }): Promise<any> {
    const url = `/merchants`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_get_merchant(id: string): Promise<any> {
    const url = `/merchants/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async merchant_controller_update_merchant(id: string, data?: any): Promise<any> {
    const url = `/merchants/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_delete_merchant(id: string): Promise<any> {
    const url = `/merchants/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async merchant_controller_create_product_catalog(data?: any): Promise<any> {
    const url = `/merchants/catalog/products`;
    const config = {};

    return axios.post(url, data, config);
  }

  async merchant_controller_get_all_product_catalogs(params?: { usageType?: any }): Promise<any> {
    const url = `/merchants/catalog/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_get_product_catalog(id: string): Promise<any> {
    const url = `/merchants/catalog/products/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async merchant_controller_update_product_catalog(id: string, data?: any): Promise<any> {
    const url = `/merchants/catalog/products/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_get_all_merchant_products(params?: { merchantId?: any, storeId?: any, isAvailable?: any }): Promise<any> {
    const url = `/merchants/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_create_merchant_product(data?: any): Promise<any> {
    const url = `/merchants/products`;
    const config = {};

    return axios.post(url, data, config);
  }

  async merchant_controller_get_merchant_product(id: string): Promise<any> {
    const url = `/merchants/products/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async merchant_controller_update_merchant_product(id: string, data?: any): Promise<any> {
    const url = `/merchants/products/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_delete_merchant_product(id: string): Promise<any> {
    const url = `/merchants/products/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async merchant_controller_get_merchant_products(merchantId: string, params?: { storeId?: any, isAvailable?: any }): Promise<any> {
    const url = `/merchants/${merchantId}/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_get_store_products(storeId: string, params?: { sectionId?: any }): Promise<any> {
    const url = `/merchants/stores/${storeId}/products`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_update_stock(id: string, data?: any): Promise<any> {
    const url = `/merchants/products/${id}/stock`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_create_category(data?: any): Promise<any> {
    const url = `/merchants/categories`;
    const config = {};

    return axios.post(url, data, config);
  }

  async merchant_controller_get_categories(params?: { parent?: any }): Promise<any> {
    const url = `/merchants/categories`;
    const config = { params };

    return axios.get(url, config);
  }

  async merchant_controller_update_category(id: string, data?: any): Promise<any> {
    const url = `/merchants/categories/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_delete_category(id: string): Promise<any> {
    const url = `/merchants/categories/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async merchant_controller_create_attribute(data?: any): Promise<any> {
    const url = `/merchants/attributes`;
    const config = {};

    return axios.post(url, data, config);
  }

  async merchant_controller_get_attributes(): Promise<any> {
    const url = `/merchants/attributes`;
    const config = {};

    return axios.get(url, config);
  }

  async merchant_controller_update_attribute(id: string, data?: any): Promise<any> {
    const url = `/merchants/attributes/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async merchant_controller_delete_attribute(id: string): Promise<any> {
    const url = `/merchants/attributes/${id}`;
    const config = {};

    return axios.delete(url, config);
  }
}