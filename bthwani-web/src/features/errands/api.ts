// src/features/errands/api.ts
import { calculateErrandFee, createErrand } from "../../api/akhdimni";
import type { ErrandForm } from "./types";

/**
 * حساب رسوم المهمة
 * @deprecated استخدم calculateErrandFee من api/akhdimni مباشرة
 */
export async function fetchErrandFee(form: ErrandForm) {
  const data = await calculateErrandFee({
    category: form.category,
    size: form.size || 'medium',
    weightKg: form.weightKg ? Number(form.weightKg) : undefined,
    pickup: {
      location: {
        lat: form.pickup.location.lat!,
        lng: form.pickup.location.lng!,
      },
      city: form.pickup.city,
      street: form.pickup.street,
    },
    dropoff: {
      location: {
        lat: form.dropoff.location.lat!,
        lng: form.dropoff.location.lng!,
      },
      city: form.dropoff.city,
      street: form.dropoff.street,
    },
    tip: form.tip ? Number(form.tip) : 0,
  });
  
  return {
    distanceKm: data.distanceKm,
    deliveryFee: data.deliveryFee,
    totalWithTip: data.totalWithTip,
  };
}

/**
 * إنشاء طلب أخدمني
 * @deprecated استخدم createErrand من api/akhdimni مباشرة
 */
export async function submitErrandOrder(payload: {
  paymentMethod: ErrandForm["paymentMethod"];
  scheduledFor: string | null;
  tip: number;
  notes?: string;
  errand: {
    category: ErrandForm["category"];
    description?: string;
    size?: ErrandForm["size"];
    weightKg?: number;
    pickup: ErrandForm["pickup"];
    dropoff: ErrandForm["dropoff"];
    waypoints: ErrandForm["waypoints"];
  };
}) {
  const data = await createErrand({
    category: payload.errand.category,
    description: payload.errand.description,
    size: payload.errand.size || 'medium',
    weightKg: payload.errand.weightKg,
    pickup: {
      ...payload.errand.pickup,
      location: {
        lat: payload.errand.pickup.location.lat ?? 0,
        lng: payload.errand.pickup.location.lng ?? 0,
      },
    },
    dropoff: {
      ...payload.errand.dropoff,
      location: {
        lat: payload.errand.dropoff.location.lat ?? 0,
        lng: payload.errand.dropoff.location.lng ?? 0,
      },
    },
    waypoints: payload.errand.waypoints,
    tip: payload.tip,
    scheduledFor: payload.scheduledFor,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
  });
  
  return data;
}
