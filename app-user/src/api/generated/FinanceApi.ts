import axios from 'axios';

export class FinanceApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async finance_controller_create_commission(data?: any): Promise<any> {
    const url = `/finance/commissions`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_my_commissions(params?: { status?: any }): Promise<any> {
    const url = `/finance/commissions/my`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_get_my_commission_stats(): Promise<any> {
    const url = `/finance/commissions/stats/my`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_approve_commission(id: string, data?: any): Promise<any> {
    const url = `/finance/commissions/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_cancel_commission(id: string, data?: any): Promise<any> {
    const url = `/finance/commissions/${id}/cancel`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_create_payout_batch(data?: any): Promise<any> {
    const url = `/finance/payouts/batches`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_payout_batches(params?: { status?: any, limit?: any, cursor?: any }): Promise<any> {
    const url = `/finance/payouts/batches`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_get_payout_batch(id: string): Promise<any> {
    const url = `/finance/payouts/batches/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_get_payout_batch_items(id: string): Promise<any> {
    const url = `/finance/payouts/batches/${id}/items`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_approve_payout_batch(id: string, data?: any): Promise<any> {
    const url = `/finance/payouts/batches/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_complete_payout_batch(id: string, data?: any): Promise<any> {
    const url = `/finance/payouts/batches/${id}/complete`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_create_settlement(data?: any): Promise<any> {
    const url = `/finance/settlements`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_entity_settlements(entityId: string, params?: { entityModel?: any, status?: any }): Promise<any> {
    const url = `/finance/settlements/entity/${entityId}`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_get_settlement(id: string): Promise<any> {
    const url = `/finance/settlements/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_approve_settlement(id: string, data?: any): Promise<any> {
    const url = `/finance/settlements/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_create_coupon(data?: any): Promise<any> {
    const url = `/finance/coupons`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_coupons(params?: { isActive?: any }): Promise<any> {
    const url = `/finance/coupons`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_validate_coupon(data?: any): Promise<any> {
    const url = `/finance/coupons/validate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_update_coupon(id: string, data?: any): Promise<any> {
    const url = `/finance/coupons/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_create_reconciliation(data?: any): Promise<any> {
    const url = `/finance/reconciliations`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_reconciliations(params?: { status?: any }): Promise<any> {
    const url = `/finance/reconciliations`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_get_reconciliation(id: string): Promise<any> {
    const url = `/finance/reconciliations/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_add_actual_totals(id: string, data?: any): Promise<any> {
    const url = `/finance/reconciliations/${id}/actual-totals`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_add_reconciliation_issue(id: string, data?: any): Promise<any> {
    const url = `/finance/reconciliations/${id}/issues`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_resolve_reconciliation_issue(id: string, issueIndex: string, data?: any): Promise<any> {
    const url = `/finance/reconciliations/${id}/issues/${issueIndex}/resolve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_generate_daily_report(data?: any): Promise<any> {
    const url = `/finance/reports/daily`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_get_daily_report(date: string): Promise<any> {
    const url = `/finance/reports/daily/${date}`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_get_reports(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/finance/reports`;
    const config = { params };

    return axios.get(url, config);
  }

  async finance_controller_finalize_report(id: string, data?: any): Promise<any> {
    const url = `/finance/reports/${id}/finalize`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async finance_controller_get_commission_plans(): Promise<any> {
    const url = `/finance/commission-plans`;
    const config = {};

    return axios.get(url, config);
  }

  async finance_controller_create_commission_plan(data?: any): Promise<any> {
    const url = `/finance/commission-plans`;
    const config = {};

    return axios.post(url, data, config);
  }

  async finance_controller_update_commission_plan(id: string, data?: any): Promise<any> {
    const url = `/finance/commission-plans/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }
}