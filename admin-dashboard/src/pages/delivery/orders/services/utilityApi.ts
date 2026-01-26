// عدّل مسار axios إذا لزم
import axios from "../../../../utils/axios";
import type { AxiosResponse } from "axios";

export type UtilityKind = "gas" | "water";
export type WaterSizeKey = "small" | "medium" | "large";

export type GasOption = {
  city: string;
  cylinderSizeLiters: number; // افتراضي 20
  pricePerCylinder: number;
  minQty: number; // حد أدنى (اختياري)
  deliveryPolicy: "flat" | "strategy";
  flatFee: number | null;
};

export type WaterOption = {
  city: string;
  sizes: Array<{
    key: WaterSizeKey;
    capacityLiters: number;
    pricePerTanker: number;
  }>;
  allowHalf: boolean;
  halfPolicy: "linear" | "multiplier" | "fixed";
  deliveryPolicy: "flat" | "strategy";
  flatFee: number | null;
};

export type UtilityOptionsResp = {
  city: string;
  gas: GasOption | null;
  water: WaterOption | null;
};

export type DailyPriceEntry = {
  _id?: string;
  kind: UtilityKind; // gas | water
  city: string;
  date: string; // YYYY-MM-DD
  price: number; // override للسعر
  variant?: string; // gas: "20L" | water: "small|medium|large"
};

export const UtilityApi = {
  // إحضار الإعدادات الحالية لمدينة
  getOptions: (city: string) =>
    axios
      .get<UtilityOptionsResp>("/utility/options", { params: { city } })
      .then((r: AxiosResponse<UtilityOptionsResp>) => r.data),

  // حفظ إعدادات الغاز
  upsertGas: (body: GasOption) =>
    axios
      .patch("/utility/options/gas", body)
      .then((r: AxiosResponse) => r.data),

  // حفظ إعدادات الماء
  upsertWater: (body: WaterOption) =>
    axios
      .patch("/utility/options/water", body)
      .then((r: AxiosResponse) => r.data),

  // المدن المتاحة (بدّل المسار حسب المتاح لديك)
  getCities: () =>
    axios
      .get<string[]>("/meta/cities")
      .then((r: AxiosResponse<string[]>) => r.data),

  // الأسعار اليومية (Override)
  listDaily: (kind: UtilityKind, city: string) =>
    axios
      .get<DailyPriceEntry[]>("/utility/daily", { params: { kind, city } })
      .then((r: AxiosResponse<DailyPriceEntry[]>) => r.data),

  upsertDaily: (entry: DailyPriceEntry) =>
    axios
      .post<DailyPriceEntry>("/utility/daily", entry)
      .then((r: AxiosResponse<DailyPriceEntry>) => r.data),

  deleteDaily: (id: string) => axios.delete(`/utility/daily/${id}`),

  // بديل في حال السيرفر لا يقدم id للحذف (حذف حسب مفتاح مركب)
  deleteDailyByKey: (
    kind: UtilityKind,
    city: string,
    date: string,
    variant?: string
  ) =>
    axios.delete(`/utility/daily`, { params: { kind, city, date, variant } }),
};
