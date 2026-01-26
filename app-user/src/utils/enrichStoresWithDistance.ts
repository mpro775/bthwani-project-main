import { fetchUserProfile } from "@/api/userApi";
import { DeliveryStore } from "@/types/types";
import {
  CategoryKind,
  estimateOrderTiming,
  haversineDistance,
} from "@/utils/distanceUtils";

export type DeliveryStoreWithDistance = DeliveryStore & {
  distance?: string; // نص للعرض
  distanceKm?: number;
  isTrending?: boolean;
  // رقم للفرز
  time?: string; // نطاق الدقائق "18–24 دقيقة"
  timeBreakdown?: {
    travel: number;
    prep: number;
    dispatch: number;
    buffer: number;
    total: number;
    min: number;
    max: number;
  };
};

const isValidCoord = (v?: number) =>
  Number.isFinite(v) && Math.abs(v!) > 0.0001;

export async function enrichStoresWithDistance(
  stores: DeliveryStore[]
): Promise<DeliveryStoreWithDistance[]> {
  // 1) محاولة الحصول على موقع المستخدم من بروفايله
  let userLocation: { lat: number; lng: number } | null = null;
  try {
    const user = await fetchUserProfile();
    const loc = user?.defaultAddress?.location;
    if (isValidCoord(loc?.lat) && isValidCoord(loc?.lng)) {
      userLocation = { lat: Number(loc.lat), lng: Number(loc.lng) };
    }
  } catch (e) {}

  const uLat = userLocation?.lat;
  const uLng = userLocation?.lng;

  // 2) إرجاع المتاجر مُثرية بالمسافة والزمن
  return stores.map((store) => {
    const sLat = Number((store as any)?.location?.lat);
    const sLng = Number((store as any)?.location?.lng);

    const hasCoords =
      isValidCoord(sLat) &&
      isValidCoord(sLng) &&
      isValidCoord(uLat) &&
      isValidCoord(uLng);

    if (!hasCoords) {
      return {
        ...store,
        distance: "غير محدد",
        distanceKm: Number.POSITIVE_INFINITY,
        time: "غير محدد",
      };
    }

    // 3) حساب المسافة
    const dKm = haversineDistance(uLat as number, uLng as number, sLat, sLng);

    // 4) تقدير الوقت
    const category: CategoryKind =
      (store as any)?.category?.usageType ??
      ((store as any)?.usageType as CategoryKind) ??
      "other";

    const avgPrepFromStore =
      (store as any)?.avgPrepTimeMin ??
      (store as any)?.prepTimeMin ??
      undefined;

    const queueSize =
      (store as any)?.queueSize ?? (store as any)?.pendingOrders ?? 0;

    const timing = estimateOrderTiming(dKm, {
      category,
      storePrepTimeMin: avgPrepFromStore,
      queueSize,
      averageSpeedKmh: 32, // داخل المدن
      trafficMultiplier: 1.1, // ازدحام خفيف
      dispatchLatencyMin: 6,
      baseBufferMin: 3,
      rangeFactor: 0.15,
    });

    return {
      ...store,
      distance: `${dKm.toFixed(2)}`, // (أضف "كم" في العرض UI إن رغبت)
      distanceKm: dKm,
      time: timing.label, // مثل "18–24 دقيقة"
      timeBreakdown: {
        travel: timing.travelTimeMin,
        prep: timing.prepTimeMin,
        dispatch: timing.dispatchLatencyMin,
        buffer: timing.bufferMin,
        total: timing.totalEtaMin,
        min: timing.minEtaMin,
        max: timing.maxEtaMin,
      },
    };
  });
}
