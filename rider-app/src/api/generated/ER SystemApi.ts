import axios from 'axios';

export class ER SystemApi {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  async e_r_controller_create_employee(data?: any): Promise<any> {
    const url = `/er/employees`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_get_all_employees(params?: { status?: any }): Promise<any> {
    const url = `/er/employees`;
    const config = { params };

    return axios.get(url, config);
  }

  async e_r_controller_get_employee(id: string): Promise<any> {
    const url = `/er/employees/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async e_r_controller_update_employee(id: string, data?: any): Promise<any> {
    const url = `/er/employees/${id}`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_delete_employee(id: string): Promise<any> {
    const url = `/er/employees/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async e_r_controller_check_in(data?: any): Promise<any> {
    const url = `/er/attendance/check-in`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_check_out(data?: any): Promise<any> {
    const url = `/er/attendance/check-out`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_get_employee_attendance(employeeId: string, params?: { month?: any, year?: any }): Promise<any> {
    const url = `/er/attendance/${employeeId}`;
    const config = { params };

    return axios.get(url, config);
  }

  async e_r_controller_create_leave_request(data?: any): Promise<any> {
    const url = `/er/leave-requests`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_approve_leave_request(id: string, data?: any): Promise<any> {
    const url = `/er/leave-requests/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_reject_leave_request(id: string, data?: any): Promise<any> {
    const url = `/er/leave-requests/${id}/reject`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_generate_payroll(data?: any): Promise<any> {
    const url = `/er/payroll/generate`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_approve_payroll(id: string, data?: any): Promise<any> {
    const url = `/er/payroll/${id}/approve`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_mark_as_paid(id: string, data?: any): Promise<any> {
    const url = `/er/payroll/${id}/mark-paid`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_create_account(data?: any): Promise<any> {
    const url = `/er/accounts`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_get_accounts(params?: { type?: any }): Promise<any> {
    const url = `/er/accounts`;
    const config = { params };

    return axios.get(url, config);
  }

  async e_r_controller_get_account(id: string): Promise<any> {
    const url = `/er/accounts/${id}`;
    const config = {};

    return axios.get(url, config);
  }

  async e_r_controller_create_journal_entry(data?: any): Promise<any> {
    const url = `/er/journal-entries`;
    const config = {};

    return axios.post(url, data, config);
  }

  async e_r_controller_get_journal_entries(params?: { type?: any, status?: any, startDate?: any, endDate?: any }): Promise<any> {
    const url = `/er/journal-entries`;
    const config = { params };

    return axios.get(url, config);
  }

  async e_r_controller_post_journal_entry(id: string, data?: any): Promise<any> {
    const url = `/er/journal-entries/${id}/post`;
    const config = {};

    return axios.patch(url, data, config);
  }

  async e_r_controller_get_trial_balance(params?: { date?: any }): Promise<any> {
    const url = `/er/reports/trial-balance`;
    const config = { params };

    return axios.get(url, config);
  }

  async e_r_controller_delete_asset(id: string): Promise<any> {
    const url = `/er/assets/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async e_r_controller_delete_chart_account(id: string): Promise<any> {
    const url = `/er/accounts/chart/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async e_r_controller_delete_document(id: string): Promise<any> {
    const url = `/er/documents/${id}`;
    const config = {};

    return axios.delete(url, config);
  }

  async e_r_controller_download_document(id: string): Promise<any> {
    const url = `/er/documents/${id}/download`;
    const config = {};

    return axios.get(url, config);
  }

  async e_r_controller_delete_bulk_documents(): Promise<any> {
    const url = `/er/documents/bulk`;
    const config = {};

    return axios.delete(url, config);
  }

  async e_r_controller_export_documents(): Promise<any> {
    const url = `/er/documents/export`;
    const config = {};

    return axios.get(url, config);
  }

  async e_r_controller_delete_payroll(id: string): Promise<any> {
    const url = `/er/payroll/${id}`;
    const config = {};

    return axios.delete(url, config);
  }
}