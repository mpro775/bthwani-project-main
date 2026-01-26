import axios from "./axios-instance";

export async function createPaymentSession(payload: {
  method: string;
  orderId: string;
  amount: number;
  currency: string;
}) {
  return axios.post("/payments/create-session", payload);
}

export async function confirmPayment(payload: {
  sessionId?: string;
  orderId?: string;
  status?: string;
}) {
  return axios.post("/payments/confirm", payload);
}
