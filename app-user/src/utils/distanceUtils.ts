// utils/distanceUtils.ts

export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // كم
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --------- جديد: تقدير شامل للوقت ---------

export type CategoryKind =
  | "restaurant"
  | "grocery"
  | "pharmacy"
  | "bakery"
  | "cafe"
  | "other";

interface TimingParams {
  /** سرعة متوسطة للطرق داخل المدينة (كم/س) */
  averageSpeedKmh?: number; // افتراضي 32
  /** عامل ازدحام/ظروف (1 عادي، >1 أبطأ) */
  trafficMultiplier?: number; // افتراضي 1.1
  /** زمن إيجاد/قبول كابتن + الوصول للمتجر (دقائق) */
  dispatchLatencyMin?: number; // افتراضي 6
  /** هامش أمان ثابت (تعبئة/محاسبة/بوابة) */
  baseBufferMin?: number; // افتراضي 3

  /** نوع المتجر لتحكيم تجهيز افتراضي */
  category?: CategoryKind; // افتراضي "other"
  /** زمن تجهيز معلن من المتجر (إن وُجد) */
  storePrepTimeMin?: number; // اختياري
  /** حجم الطابور الحالي (عدد الطلبات قبل هذا الطلب) */
  queueSize?: number; // افتراضي 0
  /** دقائق إضافية لكل طلب بالطابور */
  prepPerOrderMin?: number; // افتراضي 2
  /** حد أدنى/أقصى للتجهيز بعد كل العوامل */
  minPrepMin?: number; // افتراضي 2
  maxPrepMin?: number; // افتراضي 30

  /** مقدار عدم اليقين ± للنطاق النهائي */
  rangeFactor?: number; // افتراضي 0.15 (±15%)
}

interface OrderTimingResult {
  travelTimeMin: number;
  prepTimeMin: number;
  dispatchLatencyMin: number;
  bufferMin: number;
  totalEtaMin: number;
  minEtaMin: number;
  maxEtaMin: number;
  label: string; // مثل "18–24 دقيقة"
}

/** تجهيز افتراضي لكل فئة */
const defaultPrepByCategory: Record<CategoryKind, number> = {
  restaurant: 12,
  bakery: 10,
  cafe: 7,
  grocery: 5,
  pharmacy: 3,
  other: 4,
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function estimateOrderTiming(
  distanceKm: number,
  params: TimingParams = {}
): OrderTimingResult {
  const {
    averageSpeedKmh = 32,
    trafficMultiplier = 1.1,
    dispatchLatencyMin = 6,
    baseBufferMin = 3,

    category = "other",
    storePrepTimeMin,
    queueSize = 0,
    prepPerOrderMin = 2,
    minPrepMin = 2,
    maxPrepMin = 30,

    rangeFactor = 0.15,
  } = params;

  // 1) زمن الطريق
  const travelTimeMin = Math.max(
    1,
    Math.round(
      (distanceKm / Math.max(averageSpeedKmh, 1)) * 60 * trafficMultiplier
    )
  );

  // 2) تجهيز
  const basePrep =
    typeof storePrepTimeMin === "number" && storePrepTimeMin >= 0
      ? storePrepTimeMin
      : defaultPrepByCategory[category] ?? defaultPrepByCategory.other;

  const queueExtra = Math.max(0, queueSize) * prepPerOrderMin;
  const prepTimeMin = clamp(
    Math.round(basePrep + queueExtra),
    minPrepMin,
    maxPrepMin
  );

  // 3) إجمالي
  const bufferMin = baseBufferMin;
  const totalEtaMin =
    travelTimeMin + prepTimeMin + dispatchLatencyMin + bufferMin;

  // 4) نطاق (± rangeFactor)
  const minEtaMin = Math.max(1, Math.round(totalEtaMin * (1 - rangeFactor)));
  const maxEtaMin = Math.max(
    minEtaMin + 1,
    Math.round(totalEtaMin * (1 + rangeFactor))
  );

  const label =
    minEtaMin === maxEtaMin
      ? `${maxEtaMin} دقيقة`
      : `${minEtaMin}–${maxEtaMin} دقيقة`;

  return {
    travelTimeMin,
    prepTimeMin,
    dispatchLatencyMin,
    bufferMin,
    totalEtaMin,
    minEtaMin,
    maxEtaMin,
    label,
  };
}
