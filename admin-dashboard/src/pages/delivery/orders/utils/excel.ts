import dayjs from "dayjs";
import type { OrdersFilters } from "../services/ordersApi";
import { OrdersApi } from "../services/ordersApi";

export async function downloadOrdersExcel(filters: OrdersFilters) {
  const res = await OrdersApi.exportExcel(filters);
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
