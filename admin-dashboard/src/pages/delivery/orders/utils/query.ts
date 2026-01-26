import type { OrdersFilters } from "../services/ordersApi";

export const cleanFilters = (f: OrdersFilters): OrdersFilters => {
  const r: OrdersFilters = {};
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") (r as Record<string, unknown>)[k] = v;
  });
  return r;
};
