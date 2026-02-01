import RatingModal from "@/components/RatingModal";
import COLORS from "@/constants/colors";
import axiosInstance from "@/utils/api/axiosInstance";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RouteProp, useRoute } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import Toast from 'react-native-toast-message';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "@/utils/api/config";
// تعريف الألوان

type RootStackParamList = {
  MyOrders: undefined;
  OrderDetailsScreen: {
    order: OrderData;
  };
};

type OrderKind = "marketplace" | "errand" | "utility";

type OrderErrand = {
  pickupLabel?: string;
  dropoffLabel?: string;
  category?: string; // مثل: "وثائق"، "أطعمة"...
  driverName?: string;
  deliveryFee?: number; // لو رجّعتها من الـ API
  tip?: number; // لو فيه بقشيش
};

type OrderUtility = {
  kind?: "gas" | "water";
  variant?: string;
  quantity?: number;
  city?: string;
  unitPrice?: number;
  subtotal?: number;
};

type OrderData = {
  id: string | number;
  store: string;
  storeId?: string;
  date: string;
  time: string;
  address: string;
  status: string;
  basket: OrderProduct[];
  total: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  notes?: string;

  // 👇 إضافات مهمة لتمييز الأنواع
  orderType?: OrderKind; // "errand" | "marketplace" | "utility"
  kind?: OrderKind; // احتياط لو اسم مختلف
  errand?: OrderErrand;
  utility?: OrderUtility;
};

type OrderProduct = {
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
};

// Helpers: تحديد النوع + لواصق "من/إلى"
function getKind(o: Partial<OrderData>): OrderKind {
  const t = (o.orderType || (o as any).kind) as string | undefined;

  // تطبيع صريح
  if (t === "utility" || t === "errand" || t === "marketplace")
    return t as OrderKind;

  // دعم قيم backend مثل "gas"/"water"
  if (t === "gas" || t === "water") return "utility";

  if (o.utility) return "utility";
  if (o.errand) return "errand";
  return "marketplace";
}

function safeText(v: unknown) {
  const s = String(v ?? "").trim();
  return s ? s : "—";
}

// استخراج عنوان من نقطة أخدمني (إما label جاهز أو من كائن pickup/dropoff الخام من الباكند)
function getErrandPointLabel(
  labelOrPoint: string | undefined,
  point: { label?: string; city?: string; street?: string } | undefined
): string {
  if (labelOrPoint && String(labelOrPoint).trim()) return String(labelOrPoint).trim();
  if (!point) return "—";
  if (point.label && String(point.label).trim()) return String(point.label).trim();
  if (point.city || point.street)
    return [point.city, point.street].filter(Boolean).join("، ") || "—";
  return "—";
}

// ترجمة طريقة الدفع للعرض
function getPaymentMethodLabel(method: string | undefined): string {
  if (!method) return "—";
  const m = String(method).toLowerCase();
  if (m === "cash") return "نقداً";
  if (m === "wallet") return "محفظة";
  if (m === "card") return "بطاقة";
  if (m === "mixed") return "مختلط";
  return method;
}

// ترجمة حالة طلب أخدمني من الباكند للعرض والتايملاين
const ERRAND_STATUS_MAP: Record<string, string> = {
  created: "في انتظار التأكيد",
  assigned: "تم الإسناد",
  driver_enroute_pickup: "في الطريق",
  picked_up: "في الطريق",
  driver_enroute_dropoff: "في الطريق",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};
const ERRAND_STAGE_INDEX: Record<string, number> = {
  created: 0,
  assigned: 1,
  driver_enroute_pickup: 1,
  picked_up: 2,
  driver_enroute_dropoff: 2,
  delivered: 3,
  cancelled: -1,
};
function getErrandStatusDisplay(rawStatus: string | undefined): string {
  if (!rawStatus) return "—";
  return ERRAND_STATUS_MAP[String(rawStatus).toLowerCase()] ?? rawStatus;
}
function getErrandStageIndex(rawStatus: string | undefined): number {
  if (!rawStatus) return 0;
  const idx = ERRAND_STAGE_INDEX[String(rawStatus).toLowerCase()];
  return idx === undefined ? 0 : Math.max(0, idx);
}

// مراحل التتبع حسب النوع (تايملاين)
const STAGES_BY_KIND: Record<OrderKind, readonly string[]> = {
  marketplace: [
    "قيد المراجعة",
    "قيد التحضير",
    "في الطريق",
    "تم التوصيل",
  ] as const,
  errand: [
    "في انتظار التأكيد",
    "تم الإسناد",
    "في الطريق",
    "تم التوصيل",
  ] as const,
  utility: ["قيد المراجعة", "قيد التحضير", "في الطريق", "تم التوصيل"] as const, // لو أردت غاز/وايت لها نفس السلم
};

const OrderDetailsScreen = () => {
  type RouteType = RouteProp<RootStackParamList, "OrderDetailsScreen">;
  const route = useRoute<RouteType>();
  const { order } = route.params;

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState(false);

  // ⭐ حالة تقييم المتجر المُجمّع
  const [storeRating, setStoreRating] = useState<{
    avg: number;
    count: number;
    percent: number;
  } | null>(null);
  const [loadingStoreRating, setLoadingStoreRating] = useState(false);

  // متغيرات السوكيت للتحديث اللحظي
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // تحديد نوع الطلب ومراحله
  const kind = getKind(order);
  const STAGES = STAGES_BY_KIND[kind];

  const isDelivered = useMemo(
    () =>
      order.status === "تم التوصيل" ||
      (order as any).rawStatus === "delivered",
    [order.status, (order as any).rawStatus]
  );
  const canRate = useMemo(
    () =>
      isDelivered &&
      !submitting &&
      !rated &&
      (kind === "marketplace" || kind === "utility" || kind === "errand"),
    [isDelivered, submitting, rated, kind]
  );

  // قيَم آمنة حسب النوع
  const o: any = order || {};
  const isErrand = kind === "errand";
  const isUtility = kind === "utility";

  const serviceName = isUtility
    ? o.utility?.kind === "gas"
      ? "خدمة الغاز"
      : o.utility?.kind === "water"
      ? "خدمة الوايت"
      : "الخدمة"
    : undefined;
  // أرقام آمنة
  const deliveryFeeSafe = Number(o.deliveryFee ?? o.errand?.deliveryFee ?? 0);
  const discountSafe = Number(o.discount ?? 0);
  const tipSafe = Number(o.errand?.tip ?? 0);

  // نصوص آمنة
  const storeSafe = String(
    order.store ?? (isErrand ? "اخدمني" : isUtility ? serviceName : "—")
  );

  // العنوان: لأخدمني استعمل dropoff (يدعم شكل الباكند الخام pickup/dropoff أو المُحوّل pickupLabel/dropoffLabel)
  const errandPickupDisplay = getErrandPointLabel(
    o.errand?.pickupLabel,
    o.errand?.pickup
  );
  const errandDropoffDisplay = getErrandPointLabel(
    o.errand?.dropoffLabel,
    o.errand?.dropoff
  );
  const addressSafe = isErrand
    ? errandDropoffDisplay
    : safeText(order.address);

  // قائمة المنتجات بحسب النوع
  const basket = useMemo(() => {
    // إن كانت واجهتك استلمت قائمة جاهزة من الباك (المتاجر)، اعرضها كما هي
    if (
      Array.isArray((order as any)?.basket) &&
      (order as any).basket.length > 0
    ) {
      return (order as any).basket as OrderProduct[];
    }

    // أخدمني: بند واحد يمثل رسوم التوصيل (مع فئة المشوار)
    if (isErrand) {
      const name = o.errand?.category
        ? `مشوار — ${o.errand.category}`
        : "مشوار اخدمني";
      const fee = Number(o.deliveryFee ?? o.errand?.deliveryFee ?? 0);
      return [{ name, quantity: 1, price: fee || 0 }];
    }

    // Utility: بند واحد واضح حسب النوع/الكمية/السعر
    if (isUtility) {
      const u = o.utility || {};
      const qty = Math.max(1, Number(u.quantity ?? 1));

      // حاول إيجاد subtotal للسلع:
      const itemsSubtotalGuess = Number(
        // لو جالك subtotal من الباك
        u.subtotal ??
          // أو itemsTotal إن كان موجود في كائن الطلب
          o.itemsTotal ??
          // وإلا استنتجه من الإجمالي الكلي
          (o.total ?? o.price ?? 0) - deliveryFeeSafe - discountSafe - tipSafe
      );

      // احسب سعر الوحدة مع كل الـ fallbacks الممكنة
      const unitPrice = Number(
        u.unitPrice ?? (itemsSubtotalGuess ? itemsSubtotalGuess / qty : 0)
      );

      const name =
        u.kind === "gas"
          ? `دبّة غاز ${u.variant || ""}`.trim()
          : u.kind === "water"
          ? `وايت ${u.variant || ""}`.trim()
          : "خدمة";

      return [{ name, quantity: qty, price: unitPrice || 0 }];
    }

    // افتراضي
    return [];
  }, [order, isErrand, isUtility]);

  // إجماليات بعد العروض
  const { subtotal, subtotalOriginal, promoSavings } = useMemo(() => {
    const subtotal = basket.reduce((s, i) => s + i.price * i.quantity, 0);
    const subtotalOriginal = basket.reduce(
      (s, i) => s + (i.originalPrice ?? i.price) * i.quantity,
      0
    );
    const promoSavings = Math.max(0, subtotalOriginal - subtotal);
    return { subtotal, subtotalOriginal, promoSavings };
  }, [basket]);

  // الإجمالي النهائي الآمن (يدعم totalPrice من طلبات أخدمني)
  const totalSafe = Number(
    o.total ?? o.price ?? o.totalPrice ?? subtotal + deliveryFeeSafe - discountSafe + tipSafe
  );

  /** 🧭 جلب تقييم المتجر الحقيقي من الـ backend */
  const fetchStoreRating = async () => {
    if (!order.storeId) return;
    setLoadingStoreRating(true);
    try {
      const url = `${API_URL}/delivery-stores/${order.storeId}/rating-live`;
      const { data } = await axiosInstance.get(url);
      const avg = Number(data?.rating ?? 0);
      const count = Number(data?.ratingsCount ?? 0);
      const percent = Math.round((avg / 5) * 100);
      setStoreRating({ avg, count, percent });
    } catch (_) {
      // صامت
    } finally {
      setLoadingStoreRating(false);
    }
  };

  useEffect(() => {
    fetchStoreRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.storeId]);

  // إعداد السوكيت والانضمام لغرفة الطلب
  useEffect(() => {
    if (!order?.id) return;

    let mounted = true;

    const setupSocket = async () => {
      try {
        // إنشاء السوكيت إذا لم يكن موجودًا
        if (!socketRef.current) {
          socketRef.current = io(API_URL, { transports: ["websocket"] });
        }

        const socket = socketRef.current;

        socket.on("connect", () => {
          if (mounted) setSocketConnected(true);
          // الانضمام لغرفة الطلب
          socket.emit("join:order", { orderId: order.id });
        });

        socket.on("disconnect", () => {
          if (mounted) setSocketConnected(false);
        });

        // مستمعي الأحداث لتحديث التفاصيل
        const handleOrderUpdate = (data: any) => {
          // يمكن إضافة منطق لتحديث بيانات الطلب هنا
          Toast.show({
            type: 'info',
            text1: 'تحديث طلب',
            text2: `طلب رقم ${data.orderId}`,
          });
        };

        socket.on("order.status", handleOrderUpdate);
        socket.on("order.sub.status", handleOrderUpdate);
        socket.on("order.driver.assigned", handleOrderUpdate);
        socket.on("order.note.added", handleOrderUpdate);

        // الانضمام فورًا إذا كان السوكيت متصلًا
        if (socket.connected) {
          socket.emit("join:order", { orderId: order.id });
        }

      } catch (error) {
        console.error("Socket setup error:", error);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketRef.current?.connected) {
        socketRef.current.emit("leave:order", { orderId: order.id });
      }
    };
  }, [order?.id]);

  /** ⬅️ إرسال التقييم — مسار الباكند حسب نوع الطلب */
  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!canRate) {
      Alert.alert("لا يمكن التقييم الآن", "يجب أن يكون الطلب (تم التوصيل).");
      return;
    }
    try {
      setSubmitting(true);
      const orderId = String(order.id ?? (order as any)._id);
      if (kind === "marketplace") {
        await axiosInstance.post(`/delivery/order/${orderId}/rate`, {
          rating,
          comment,
        });
      } else if (kind === "utility") {
        await axiosInstance.post(`/utility/order/${orderId}/rate`, {
          rating,
          review: comment,
        });
      } else if (kind === "errand") {
        await axiosInstance.post(`/akhdimni/errands/${orderId}/rate`, {
          driver: rating,
          service: rating,
          comments: comment,
        });
      } else {
        throw new Error("نوع الطلب غير مدعوم للتقييم");
      }
      setRated(true);
      setShowRatingModal(false);
      Alert.alert("تم", "تم حفظ تقييمك بنجاح ✅");
      if (kind === "marketplace" && order.storeId) await fetchStoreRating();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "تعذّر حفظ التقييم. حاول مجددًا لاحقًا.";
      Alert.alert("خطأ", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // عرض الحالة ومرحلة التايملاين (يدعم حالة الباكند الخام لطلبات أخدمني)
  const displayStatus = isErrand
    ? getErrandStatusDisplay((o as any).status ?? order.status)
    : order.status;
  const activeIndex = isErrand
    ? getErrandStageIndex((o as any).status ?? order.status)
    : Math.max(0, STAGES.indexOf(order.status as any));
  const orderIdDisplay = String(
    order.id ?? (o as any)._id ?? (o as any).orderNumber ?? "—"
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* شريط الحالة العلوي */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.statusHeader}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      >
        <Text style={styles.orderNumber}>الطلب #{orderIdDisplay}</Text>
        <View style={styles.statusPill}>
          <Ionicons name="timer" size={18} color="#fff" />
          <Text style={styles.statusText}>{displayStatus}</Text>
        </View>
      </LinearGradient>

      {/* البطاقة الرئيسية */}
      <View style={styles.mainCard}>
        {/* شريط التتبع الزمني */}
        <View style={styles.timelineContainer}>
          {STAGES.map((stage, index) => {
            const isDone = index <= activeIndex;
            const isActive = displayStatus === stage;
            return (
              <View key={index} style={styles.timelineStep}>
                <View
                  style={[
                    styles.timelineDot,
                    isActive && styles.activeDot,
                    isDone && styles.completedDot,
                  ]}
                >
                  {isDone && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    isActive && styles.activeLabel,
                  ]}
                >
                  {stage}
                </Text>
                {index < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      index < activeIndex && styles.completedLine,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* معلومات الطلب + تقييم المتجر */}
        <View style={styles.infoSection}>
          {!isErrand && !isUtility && (
            <DetailItem
              icon="storefront"
              title="المتجر"
              value={String(order.store || "—")}
            />
          )}
          {/* تقييم المتجر فقط للمتاجر */}
          {!!order.storeId && !isErrand && !isUtility && (
            <View style={styles.storeRatingRow}>
              {loadingStoreRating ? (
                <ActivityIndicator size="small" />
              ) : storeRating ? (
                <StoreRatingBadge
                  avg={storeRating.avg}
                  percent={storeRating.percent}
                  count={storeRating.count}
                />
              ) : (
                <Text style={styles.noRatingText}>لا توجد تقييمات بعد</Text>
              )}
            </View>
          )}

          {/* تاريخ/وقت */}
          <DetailItem
            icon="time"
            title="تاريخ الطلب"
            value={`${order.date} - ${order.time}`}
          />

          {/* لأخدمني: من/إلى */}
          {isErrand ? (
            <>
              <DetailItem
                icon="location"
                title="من"
                value={errandPickupDisplay}
              />
              <DetailItem
                icon="location"
                title="إلى"
                value={errandDropoffDisplay}
              />
            </>
          ) : (
            <DetailItem icon="location" title="العنوان" value={addressSafe} />
          )}

          {/* Utility: نوع الخدمة */}
          {isUtility && !!o.utility?.kind && (
            <DetailItem
              icon="storefront"
              title="نوع الخدمة"
              value={
                o.utility.kind === "gas"
                  ? `غاز ${o.utility.variant || ""}`.trim()
                  : o.utility.kind === "water"
                  ? `وايت ${o.utility.variant || ""}`.trim()
                  : "خدمة"
              }
            />
          )}

          <DetailItem
            icon="wallet"
            title="طريقة الدفع"
            value={getPaymentMethodLabel(order.paymentMethod ?? (o as any).paymentMethod)}
          />
        </View>

        {/* قائمة المنتجات (مع العروض) */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {isErrand
              ? "تفاصيل المشوار"
              : isUtility
              ? "تفاصيل الخدمة"
              : "المنتجات المطلوبة"}
          </Text>
          {basket.map((item, index) => {
            const hasStrike =
              !!item.originalPrice && item.originalPrice > item.price;
            const unitPercent = hasStrike
              ? Math.round(
                  ((item.originalPrice! - item.price) / item.originalPrice!) *
                    100
                )
              : 0;

            const lineNew = (item.price * item.quantity).toFixed(1);
            const lineOld = hasStrike
              ? (item.originalPrice! * item.quantity).toFixed(1)
              : null;

            return (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName}>{item.name}</Text>

                <View style={styles.productDetails}>
                  {/* الشارة -٪ */}
                  {hasStrike && (
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>-{unitPercent}%</Text>
                    </View>
                  )}

                  <Text style={styles.productQty}>×{item.quantity}</Text>

                  {/* سعر الوحدة */}
                  {hasStrike ? (
                    <View style={styles.unitPriceStack}>
                      <Text style={styles.unitOld}>
                        {item.originalPrice!.toFixed(1)} ر.ي
                      </Text>
                      <Text style={styles.unitNew}>
                        {item.price.toFixed(1)} ر.ي
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.unitNew}>
                      {item.price.toFixed(1)} ر.ي
                    </Text>
                  )}

                  {/* إجمالي السطر */}
                  {hasStrike ? (
                    <View style={styles.linePriceStack}>
                      <Text style={styles.lineOld}>{lineOld} ر.ي</Text>
                      <Text style={styles.lineNew}>{lineNew} ر.ي</Text>
                    </View>
                  ) : (
                    <Text style={styles.lineNew}>{lineNew} ر.ي</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ملخص الدفع */}
        <View style={styles.paymentSummary}>
          {/* subtotalOriginal/subtotal: أظهرهم فقط إذا فيه basket متعددة أو عروض */}
          {!isErrand && (
            <>
              <SummaryRow
                label="الإجمالي الفرعي قبل العرض"
                value={subtotalOriginal.toFixed(1)}
              />
              {promoSavings > 0 && (
                <SummaryRow
                  label="توفير العروض"
                  value={`-${promoSavings.toFixed(1)}`}
                  color="#4CAF50"
                />
              )}
              <SummaryRow label="الإجمالي الفرعي" value={subtotal.toFixed(1)} />
            </>
          )}

          {/* رسوم التوصيل (مؤمّنة) */}
          <SummaryRow label="رسوم التوصيل" value={deliveryFeeSafe.toFixed(1)} />

          {/* بقشيش إن وُجد */}
          {tipSafe > 0 && (
            <SummaryRow label="بقشيش" value={tipSafe.toFixed(1)} />
          )}

          {/* الخصم إن وُجد */}
          {discountSafe > 0 && (
            <SummaryRow
              label="الخصم"
              value={`-${discountSafe.toFixed(1)}`}
              color={COLORS.primary}
            />
          )}

          <View style={styles.divider} />
          <SummaryRow
            label="الإجمالي النهائي"
            value={totalSafe.toFixed(1)}
            bold
          />
        </View>

        {/* الملاحظات */}
        {order.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>ملاحظات خاصة</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </View>

      {/* أزرار الإجراءات */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>تحديث الحالة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rateButton, !canRate && { opacity: 0.5 }]}
          onPress={() => setShowRatingModal(true)}
          disabled={!canRate}
        >
          <Text style={styles.rateButtonText}>
            {rated ? "تم التقييم" : "تقييم الطلب"}
          </Text>
        </TouchableOpacity>

        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleSubmitRating}
        />
      </View>
    </ScrollView>
  );
};

/** 🧩 بادج تقييم المتجر */
function StoreRatingBadge({
  avg,
  percent,
  count,
}: {
  avg: number;
  percent: number;
  count: number;
}) {
  return (
    <View style={styles.ratingBadge}>
      <Ionicons name="star" size={14} color="#fff" />
      <Text style={styles.ratingBadgeText}>{avg.toFixed(1)} / 5</Text>
      <Text style={styles.ratingBadgeDivider}>•</Text>
      <Text style={styles.ratingBadgeText}>{percent}%</Text>
      <Text style={styles.ratingBadgeCount}>({count})</Text>
    </View>
  );
}

const DetailItem = ({
  icon,
  title,
  value,
}: {
  icon: "storefront" | "time" | "location" | "wallet";
  title: string;
  value: string;
}) => {
  const ion = mapIcon(icon);
  return (
    <View style={styles.detailRow}>
      <Ionicons name={ion} size={20} color={COLORS.primary} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
};

/** تحويل أسماء منطقية إلى Ionicons */
function mapIcon(name: "storefront" | "time" | "location" | "wallet"): any {
  switch (name) {
    case "storefront":
      return "storefront-outline";
    case "time":
      return "time-outline";
    case "location":
      return "location-outline";
    case "wallet":
      return "wallet-outline";
    default:
      return "ellipse-outline";
  }
}

const SummaryRow = ({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && styles.boldText]}>{label}</Text>
    <Text
      style={[
        styles.summaryValue,
        { color: color || COLORS.text },
        bold && styles.boldText,
      ]}
    >
      {value} ر.ي
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginVertical: 30,
  },
  statusHeader: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
  },
  orderNumber: {
    fontFamily: "Cairo-Bold",
    fontSize: 20,
    color: "#fff",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 32,
    margin: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  rateButton: {
    backgroundColor: "#D84315",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
  },
  rateButtonText: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
    fontSize: 18,
  },
  timelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timelineStep: {
    alignItems: "center",
    position: "relative",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  completedDot: {
    backgroundColor: COLORS.primary,
  },
  timelineLabel: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 12,
    color: "#888",
  },
  activeLabel: {
    color: COLORS.primary,
  },
  timelineLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#eee",
    top: 11,
    right: -24,
    left: -24,
    zIndex: -1,
  },
  completedLine: {
    backgroundColor: COLORS.primary,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  storeRatingRow: {
    alignItems: "flex-end",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ratingBadgeText: {
    color: "#fff",
    fontFamily: "Cairo-SemiBold",
    fontSize: 12,
  },
  ratingBadgeDivider: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  ratingBadgeCount: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Cairo-Regular",
    fontSize: 12,
  },
  noRatingText: {
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailTitle: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.blue,
  },
  detailValue: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f5f5f5",
  },
  productName: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  productDetails: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  productQty: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.blue,
  },
  unitPriceStack: {
    alignItems: "flex-end",
  },
  unitOld: {
    fontSize: 12,
    color: COLORS.blue,
    textDecorationLine: "line-through",
  },
  unitNew: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  linePriceStack: {
    alignItems: "flex-end",
    minWidth: 90,
  },
  lineOld: {
    fontSize: 12,
    color: COLORS.blue,
    textDecorationLine: "line-through",
  },
  lineNew: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
  paymentSummary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.blue,
  },
  summaryValue: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 14,
  },
  boldText: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  notesSection: {
    marginTop: 16,
  },
  notesText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.blue,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  primaryButtonText: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: "#fff",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
  },
  secondaryButtonText: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.primary,
  },
  itemBadge: {
    backgroundColor: "rgba(216,67,21,0.12)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "center",
  },
  itemBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default OrderDetailsScreen;
