import axiosInstance from "../utils/axios";

export interface DriverLeaveRequest {
  _id?: string;
  driverId: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverLeaveRequestFormData {
  driverId: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

// Get all driver leave requests
export async function getDriverLeaveRequests(params?: {
  driver?: string;
  status?: "pending" | "approved" | "rejected";
  page?: number;
  pageSize?: number;
}): Promise<{
  requests: DriverLeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    requests: DriverLeaveRequest[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/leave-requests", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver leave request by ID
export async function getDriverLeaveRequest(id: string): Promise<DriverLeaveRequest> {
  const { data } = await axiosInstance.get<DriverLeaveRequest>(`/admin/drivers/leave-requests/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new driver leave request
export async function createDriverLeaveRequest(request: DriverLeaveRequestFormData): Promise<DriverLeaveRequest> {
  const { data } = await axiosInstance.post<DriverLeaveRequest>("/admin/drivers/leave-requests", request);
  return data;
}

// Update driver leave request
export async function updateDriverLeaveRequest(id: string, request: Partial<DriverLeaveRequestFormData>): Promise<DriverLeaveRequest> {
  const { data } = await axiosInstance.patch<DriverLeaveRequest>(`/admin/drivers/leave-requests/${id}`, request);
  return data;
}

// Approve driver leave request
export async function approveDriverLeaveRequest(id: string): Promise<DriverLeaveRequest> {
  const { data } = await axiosInstance.patch<DriverLeaveRequest>(`/admin/drivers/leave-requests/${id}/approve`);
  return data;
}

// Reject driver leave request
export async function rejectDriverLeaveRequest(id: string): Promise<DriverLeaveRequest> {
  const { data } = await axiosInstance.patch<DriverLeaveRequest>(`/admin/drivers/leave-requests/${id}/reject`);
  return data;
}

// Delete driver leave request
export async function deleteDriverLeaveRequest(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/drivers/leave-requests/${id}`);
}

// Get leave request statistics
export async function getLeaveRequestStats(): Promise<{
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageDuration: number;
}> {
  const { data } = await axiosInstance.get<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageDuration: number;
  }>("/admin/drivers/leave-requests/stats", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}
