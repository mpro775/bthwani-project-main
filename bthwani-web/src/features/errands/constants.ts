// src/features/errands/constants.ts
import type { PayMethod } from "./types";

export const CATS = [
  { key: "docs", label: "مستندات" },
  { key: "parcel", label: "طرود" },
  { key: "groceries", label: "مقاضي" },
  { key: "carton", label: "كرتون" },
  { key: "food", label: "ماكولات" },
  { key: "fragile", label: "قابله للكسر" },
  { key: "other", label: "أخرى" },
] as const;

export const SIZES = [
  { key: "small", label: "صغير" },
  { key: "medium", label: "متوسط" },
  { key: "large", label: "كبير" },
] as const;

export const PAY_METHODS: { key: PayMethod; label: string }[] = [
  { key: "wallet", label: "محفظة" },
  { key: "cash", label: "كاش" },
  { key: "card", label: "بطاقة" },
  { key: "mixed", label: "مختلط" },
];

export const STEPS = [
  { key: "specs", title: "المواصفات" },
  { key: "pickup", title: "الاستلام" },
  { key: "dropoff", title: "التسليم" },
  { key: "pay", title: "الدفع والجدولة" },
  { key: "review", title: "المراجعة والتأكيد" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];