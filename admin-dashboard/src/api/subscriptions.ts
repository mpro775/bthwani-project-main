import axiosInstance from "../utils/axios";
import type { Subscription } from "./wallet";

export interface SubscriptionFormData {
  user: string;
  plan: string;
  amount: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

// Get all subscriptions
export async function getSubscriptions(params?: {
  user?: string;
  plan?: string;
  status?: "active" | "cancelled" | "expired";
  page?: number;
  pageSize?: number;
}): Promise<{
  subscriptions: Subscription[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/wallet/subscriptions", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get subscription by ID
export async function getSubscription(id: string): Promise<Subscription> {
  const { data } = await axiosInstance.get<Subscription>(`/admin/wallet/subscriptions/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new subscription
export async function createSubscription(subscription: SubscriptionFormData): Promise<Subscription> {
  const { data } = await axiosInstance.post<Subscription>("/admin/wallet/subscriptions", subscription);
  return data;
}

// Update subscription
export async function updateSubscription(id: string, subscription: Partial<SubscriptionFormData>): Promise<Subscription> {
  const { data } = await axiosInstance.patch<Subscription>(`/admin/wallet/subscriptions/${id}`, subscription);
  return data;
}

// Cancel subscription
export async function cancelSubscription(id: string): Promise<Subscription> {
  const { data } = await axiosInstance.patch<Subscription>(`/admin/wallet/subscriptions/${id}/cancel`);
  return data;
}

// Renew subscription
export async function renewSubscription(id: string): Promise<Subscription> {
  const { data } = await axiosInstance.patch<Subscription>(`/admin/wallet/subscriptions/${id}/renew`);
  return data;
}

// Delete subscription
export async function deleteSubscription(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/wallet/subscriptions/${id}`);
}

// Get subscription statistics
export async function getSubscriptionStats(): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
}> {
  const { data } = await axiosInstance.get<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  }>("/admin/wallet/subscriptions/stats", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get subscription plans
export async function getSubscriptionPlans(): Promise<{
  plans: {
    id: string;
    name: string;
    description: string;
    amount: number;
    duration: number; // in days
    features: string[];
  }[];
}> {
  const { data } = await axiosInstance.get<{
    plans: {
      id: string;
      name: string;
      description: string;
      amount: number;
      duration: number;
      features: string[];
    }[];
  }>("/admin/wallet/subscriptions/plans", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}