import axios from "../utils/axios"; // نفس مثيل axios لديك
export const getOverviewSummary = (p: {
  from?: string;
  to?: string;
  tz?: string;
}) => axios.get("/admin/dashboard/summary", { params: p });
export const getOverviewSeries = (p: {
  metric: "orders" | "gmv" | "revenue";
  interval: "day" | "hour";
  from?: string;
  to?: string;
  tz?: string;
}) => axios.get("/admin/dashboard/timeseries", { params: p });
export const getOverviewTop = (p: {
  by: "stores" | "cities" | "categories";
  limit?: number;
  from?: string;
  to?: string;
  tz?: string;
}) => axios.get("/admin/dashboard/top", { params: p });
export const getOverviewAlerts = () => axios.get("/admin/dashboard/alerts");
