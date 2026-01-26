import axios from 'axios';

export class AdminApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async admin_controller_get_dashboard(): Promise<any> {
    const url = `/admin/dashboard`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_today_stats(): Promise<any> {
    const url = `/admin/stats/today`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_financial_stats(): Promise<any> {
    const url = `/admin/stats/financial`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_orders_by_status(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/dashboard/orders-by-status`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_revenue_analytics(params?: { period?: any, startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/dashboard/revenue`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_live_metrics(): Promise<any> {
    const url = `/admin/dashboard/live-metrics`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_all_drivers(params?: { status?: any, isAvailable?: any, page?: any, limit?: any }): Promise<any> {
    const url = `/admin/drivers`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_driver_details(id: string): Promise<any> {
    const url = `/admin/drivers/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_delete_driver(id: string): Promise<any> {
    const url = `/admin/drivers/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_controller_get_driver_performance(id: string, params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/drivers/${id}/performance`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_driver_financials(id: string): Promise<any> {
    const url = `/admin/drivers/${id}/financials`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_ban_driver(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/${id}/ban`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_unban_driver(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/${id}/unban`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_adjust_driver_balance(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/${id}/adjust-balance`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_withdrawals(params?: { status?: any, userModel?: any, page?: any, limit?: any }): Promise<any> {
    const url = `/admin/withdrawals`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_pending_withdrawals(): Promise<any> {
    const url = `/admin/withdrawals/pending`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_approve_withdrawal(id: string, data?: any): Promise<any> {
    const url = `/admin/withdrawals/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_reject_withdrawal(id: string, data?: any): Promise<any> {
    const url = `/admin/withdrawals/${id}/reject`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_pending_vendors(): Promise<any> {
    const url = `/admin/vendors/pending`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_approve_vendor(id: string, data?: any): Promise<any> {
    const url = `/admin/vendors/${id}/approve`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_reject_vendor(id: string, data?: any): Promise<any> {
    const url = `/admin/vendors/${id}/reject`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_suspend_vendor(id: string, data?: any): Promise<any> {
    const url = `/admin/vendors/${id}/suspend`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_users(params?: { search?: any, isActive?: any, page?: any, limit?: any }): Promise<any> {
    const url = `/admin/users`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_user_details(id: string): Promise<any> {
    const url = `/admin/users/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_ban_user(id: string, data?: any): Promise<any> {
    const url = `/admin/users/${id}/ban`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_unban_user(id: string, data?: any): Promise<any> {
    const url = `/admin/users/${id}/unban`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_daily_report(params?: { date?: any }): Promise<any> {
    const url = `/admin/reports/daily`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_export_report(type: string, format: string, data?: any): Promise<any> {
    const url = `/admin/reports/export/${type}/${format}`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_driver_attendance(id: string, params?: { month?: any, year?: any }): Promise<any> {
    const url = `/admin/drivers/${id}/attendance`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_attendance_summary(params?: { date?: any }): Promise<any> {
    const url = `/admin/drivers/attendance/summary`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_adjust_attendance(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/${id}/attendance/adjust`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_delete_shift(id: string): Promise<any> {
    const url = `/admin/drivers/shifts/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_controller_delete_driver_asset(id: string): Promise<any> {
    const url = `/admin/drivers/assets/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_controller_get_leave_requests(params?: { status?: any, page?: any, limit?: any }): Promise<any> {
    const url = `/admin/drivers/leave-requests`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_approve_leave_request(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/leave-requests/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_reject_leave_request(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/leave-requests/${id}/reject`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_delete_leave_request(id: string): Promise<any> {
    const url = `/admin/drivers/leave-requests/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async admin_controller_get_driver_leave_balance(id: string): Promise<any> {
    const url = `/admin/drivers/${id}/leave-balance`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_adjust_leave_balance(id: string, data?: any): Promise<any> {
    const url = `/admin/drivers/${id}/leave-balance/adjust`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_quality_metrics(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/quality/metrics`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_settings(): Promise<any> {
    const url = `/admin/settings`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_update_settings(data?: any): Promise<any> {
    const url = `/admin/settings`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_feature_flags(): Promise<any> {
    const url = `/admin/settings/feature-flags`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_update_feature_flag(flag: string, data?: any): Promise<any> {
    const url = `/admin/settings/feature-flags/${flag}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_create_backup(data?: any): Promise<any> {
    const url = `/admin/backup/create`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_list_backups(params?: { page?: any, limit?: any }): Promise<any> {
    const url = `/admin/backup/list`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_restore_backup(id: string, data?: any): Promise<any> {
    const url = `/admin/backup/${id}/restore`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_download_backup(id: string): Promise<any> {
    const url = `/admin/backup/${id}/download`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_data_deletion_requests(params?: { status?: any }): Promise<any> {
    const url = `/admin/data-deletion/requests`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_approve_data_deletion(id: string, data?: any): Promise<any> {
    const url = `/admin/data-deletion/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_reject_data_deletion(id: string, data?: any): Promise<any> {
    const url = `/admin/data-deletion/${id}/reject`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_failed_password_attempts(params?: { threshold?: any }): Promise<any> {
    const url = `/admin/security/password-attempts`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_reset_user_password(userId: string, data?: any): Promise<any> {
    const url = `/admin/security/reset-password/${userId}`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_unlock_account(userId: string, data?: any): Promise<any> {
    const url = `/admin/security/unlock-account/${userId}`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_all_marketers(params?: { status?: any, page?: any, limit?: any }): Promise<any> {
    const url = `/admin/marketers`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_create_marketer(data?: any): Promise<any> {
    const url = `/admin/marketers`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_marketer_details(id: string): Promise<any> {
    const url = `/admin/marketers/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_update_marketer(id: string, data?: any): Promise<any> {
    const url = `/admin/marketers/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async admin_controller_get_marketer_performance(id: string, params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/marketers/${id}/performance`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_marketer_stores(id: string): Promise<any> {
    const url = `/admin/marketers/${id}/stores`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_activate_marketer(id: string, data?: any): Promise<any> {
    const url = `/admin/marketers/${id}/activate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_deactivate_marketer(id: string, data?: any): Promise<any> {
    const url = `/admin/marketers/${id}/deactivate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_marketers_statistics(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/marketers/statistics`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_export_marketers(): Promise<any> {
    const url = `/admin/marketers/export`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_audit_logs(params?: { action?: any, userId?: any, startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/audit-logs`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_audit_log_details(id: string): Promise<any> {
    const url = `/admin/audit-logs/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_system_health(): Promise<any> {
    const url = `/admin/system/health`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_system_metrics(): Promise<any> {
    const url = `/admin/system/metrics`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_database_stats(): Promise<any> {
    const url = `/admin/database/stats`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_orders_by_city(params?: { startDate?: any, endDate?: any }): Promise<any> {
    const url = `/admin/orders/stats/by-city`;
    const config = { params };

    return axios.get(url, config);
  }

  async admin_controller_get_orders_by_payment_method(): Promise<any> {
    const url = `/admin/orders/stats/by-payment-method`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_drivers_by_status(): Promise<any> {
    const url = `/admin/drivers/stats/by-status`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_user_orders_history(id: string): Promise<any> {
    const url = `/admin/users/${id}/orders-history`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_clear_cache(data?: any): Promise<any> {
    const url = `/admin/cache/clear`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_get_cache_stats(): Promise<any> {
    const url = `/admin/cache/stats`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_get_roles(): Promise<any> {
    const url = `/admin/roles`;
    const config = {};

    return axios.get(url, config);
  }

  async admin_controller_create_role(data?: any): Promise<any> {
    const url = `/admin/roles`;
    const config = {};

    return axios.post(url, data, config);
  }

  async admin_controller_update_role(data?: any): Promise<any> {
    const url = `/admin/roles/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }
}