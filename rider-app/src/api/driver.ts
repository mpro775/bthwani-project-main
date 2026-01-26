
import axios from "./axios";

export const getDriverOrders = async () => {
  const response = await axios.get("/drivers/orders/available");
  return response.data;
};

export const completeOrder = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/complete`);
  return response.data;
};

// جديد:
export const updateAvailability = async (isAvailable: boolean) => {
  const response = await axios.patch("/drivers/availability", { isAvailable });
  return response.data;
};

export const getWalletSummary = async () => {
  const response = await axios.get("/drivers/earnings");
  return response.data;
};

export const listWithdrawals = async () => {
  const response = await axios.get("/drivers/withdrawals/my");
  return response.data;
};

export const requestWithdrawal = async (payload: { amount: number; method: string; accountInfo?: string }) => {
  const response = await axios.post("/drivers/withdrawals/request", payload);
  return response.data;
};

export const listOffers = async () => {
  const response = await axios.get("/drivers/orders/available");
  return response.data;
};

export const acceptOffer = async (offerId: string) => {
  const response = await axios.post(`/drivers/orders/${offerId}/accept`);
  return response.data;
};

export const listVacations = async (params?: {
  from?: string;
  to?: string;
  status?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append("from", params.from);
  if (params?.to) searchParams.append("to", params.to);
  if (params?.status) searchParams.append("status", params.status);

  const queryString = searchParams.toString();
  const url = queryString ? `/drivers/vacations/my?${queryString}` : "/drivers/vacations/my";

  const response = await axios.get(url);
  return response.data;
};

export const requestVacation = async (data: { fromDate: Date; toDate: Date; reason: string }) => {
  const response = await axios.post("/drivers/vacations/request", {
    startDate: data.fromDate.toISOString(),
    endDate: data.toDate.toISOString(),
    type: "annual",
    reason: data.reason,
  });
  return response.data;
};

export const getDriverEarnings = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `/drivers/earnings${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await axios.get(url);
  return response.data;
};

export const getDriverProfile = async () => {
  const response = await axios.get("/drivers/profile");
  return response.data;
};

export const updateDriverProfile = async (data: any) => {
  const response = await axios.patch("/drivers/profile", data);
  return response.data;
};

export const updateDriverLocation = async (lat: number, lng: number) => {
  const response = await axios.patch("/drivers/location", { lat, lng });
  return response.data;
};

export const getDriverStatistics = async () => {
  const response = await axios.get("/drivers/statistics");
  return response.data;
};

export const uploadDriverDocument = async (type: string, fileUrl: string, expiryDate?: string) => {
  const response = await axios.post("/drivers/documents/upload", {
    type,
    fileUrl,
    expiryDate,
  });
  return response.data;
};

export const getDriverDocuments = async () => {
  const response = await axios.get("/drivers/documents");
  return response.data;
};

export const getVacationBalance = async () => {
  const response = await axios.get("/drivers/vacations/balance");
  return response.data;
};

export const cancelVacation = async (vacationId: string) => {
  const response = await axios.patch(`/drivers/vacations/${vacationId}/cancel`);
  return response.data;
};

export const requestDriverWithdrawal = async (amount: number, method: string, accountInfo: any) => {
  const response = await axios.post("/drivers/withdrawals/request", {
    amount,
    method,
    accountInfo,
  });
  return response.data;
};

export const getDriverWithdrawals = async () => {
  const response = await axios.get("/drivers/withdrawals/my");
  return response.data;
};

export const getAvailableDriverOrders = async () => {
  const response = await axios.get("/drivers/orders/available");
  return response.data;
};

export const acceptDriverOrder = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/accept`);
  return response.data;
};

export const rejectDriverOrder = async (orderId: string, reason: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/reject`, { reason });
  return response.data;
};

export const startDriverDelivery = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/start-delivery`);
  return response.data;
};

export const completeDriverDelivery = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/complete`);
  return response.data;
};

export const getDriverOrdersHistory = async (cursor?: string, limit: number = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());
  const url = `/drivers/orders/history?${params.toString()}`;
  const response = await axios.get(url);
  return response.data;
};

export const reportDriverIssue = async (type: string, description: string, orderId?: string) => {
  const response = await axios.post("/drivers/issues/report", {
    type,
    description,
    orderId,
  });
  return response.data;
};