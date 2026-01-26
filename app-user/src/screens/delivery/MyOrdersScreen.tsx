// screens/MyOrdersScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";

import { fetchMyOrders, fetchUserProfile } from "@/api/userApi";
import COLORS from "@/constants/colors";
import { Order, mapOrder } from "@/utils/orderUtils";
import ScreenStateBoundary from "@/components/ui/ScreenStateBoundary";
import SocketStatusIndicator from "@/components/ui/SocketStatusIndicator";
import Toast from 'react-native-toast-message';
import { attachNotificationListeners } from "@/notify";
// ——————————————————————————————————
import { useAuth } from "@/auth/AuthContext";
import { getAuthBanner } from "@/guards/bannerGateway";

// ——————————————————————————————————
// التنقّل
type RootStackParamList = {
  MyOrders: undefined;
  OrderDetailsScreen: { order: Order };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MyOrders">;

// ——————————————————————————————————
// تصنيف الحالة → نغمة لونية
const statusTone = (raw?: string) => {
  switch (raw) {
    case "delivered":
    case "procured":
      return "success";
    case "returned":
    case "cancelled":
    case "procurement_failed":
      return "error";
    case "awaiting_procurement":
    case "preparing":
      return "warning";
    default:
      return "primary";
  }
};

// تقدّم الحالة (لشريط التقدّم العلوي في البطاقة)
const statusProgress = (raw?: string) => {
  switch (raw) {
    case "awaiting_procurement":
      return 0.2;
    case "preparing":
      return 0.4;
    case "procured":
      return 0.7;
    case "delivered":
      return 1.0;
    case "returned":
    case "cancelled":
    case "procurement_failed":
      return 1.0;
    default:
      return 0.5;
  }
};

// نغمة → لون
const toneToColor = (tone: ReturnType<typeof statusTone>) => {
  switch (tone) {
    case "success":
      return COLORS.success;
    case "error":
      return COLORS.danger;
    case "warning":
      return COLORS.orangeDark;
    default:
      return COLORS.primary;
  }
};

// ——————————————————————————————————
// التصنيفات
const categories = [
  "الكل",
  "المتاجر",
  "اخدمني",
  "الغاز",
  "وايت",
  "الخدمات",
] as const;

// API_BASE لسوكيت (نفس دومين الـ API)
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://api.bthwani.com";
const utilityLabel = (k?: "gas" | "water") =>
  k === "gas" ? "خدمة الغاز" : k === "water" ? "خدمة الوايت" : "الخدمة";

const UtilityIcon = ({ kind }: { kind?: "gas" | "water" }) => (
  <View style={[styles.storeLogo, styles.errandLogo]}>
    <Ionicons
      name={kind === "gas" ? "flame" : "water"}
      size={24}
      color={COLORS.primary}
    />
  </View>
);

// ——————————————————————————————————
const MyOrdersScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // قراءة حالة الدخول/التوثيق + حماية التحميل
  const { isLoggedIn, authReady } = useAuth();
  const [profileVerified, setProfileVerified] = useState<boolean | null>(null);

  // اختيار الشهر بصيغة YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
  });

  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("الكل");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // حالة اتصال السوكيت (لمؤشر حيّ)
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationListenersRef = useRef<any>(null);

  // Month Picker
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  useEffect(() => {
    if (orders.length) {
      const e = orders.find((o) => o.kind === "errand");
      console.log("ERRAND raw sample:", e);
    }
  }, [orders]);

  // تحميل + سوكيت
  const reloadUserOrders = async () => {
    try {
      setError(null);
      const user = await fetchUserProfile();
      setProfileVerified(!!user.isVerified); // تحديث حالة التوثيق
      const raw = await fetchMyOrders(user._id);
      setOrders((raw || []).map(mapOrder));
    } catch (e) {
      setError("فشل في تحميل الطلبات");
      console.error("Error loading orders:", e);
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        setLoading(true);

        // ✅ ضيف؟ لا نحمل ولا نفتح سوكيت
        if (authReady && !isLoggedIn) {
          return;
        }

        await reloadUserOrders();

        // Init socket
        const s = io(API_BASE, { transports: ["websocket"], forceNew: true });
        socketRef.current = s;

        // انضمام لغرفة المستخدم
        const user = await fetchUserProfile();
        s.on("connect", () => {
          setSocketConnected(true);
          s.emit("join", { room: `user_${user._id}` });
        });
        s.on("disconnect", () => setSocketConnected(false));

        const softRefresh = async () => {
          if (!mounted) return;
          await reloadUserOrders();
        };

        // مستمعي الأحداث مع عرض Toast للأحداث المهمة
        s.on("order.created", (data) => {
          Toast.show({
            type: 'info',
            text1: 'طلب جديد',
            text2: `تم إنشاء طلب رقم ${data.orderId}`,
          });
          softRefresh();
        });

        s.on("order.status", (data) => {
          Toast.show({
            type: 'info',
            text1: 'تحديث حالة طلب',
            text2: `طلب رقم ${data.orderId}`,
          });
          softRefresh();
        });

        s.on("order.sub.status", (data) => {
          Toast.show({
            type: 'info',
            text1: 'تحديث حالة منتج',
            text2: `طلب رقم ${data.orderId}`,
          });
          softRefresh();
        });

        s.on("order.driver.assigned", (data) => {
          Toast.show({
            type: 'success',
            text1: 'تم تعيين سائق',
            text2: `طلب رقم ${data.orderId}`,
          });
          softRefresh();
        });

        s.on("order.note.added", (data) => {
          Toast.show({
            type: 'info',
            text1: 'ملاحظة جديدة',
            text2: `طلب رقم ${data.orderId}`,
          });
          softRefresh();
        });

        s.on("notification", softRefresh);

        // Poll احتياطي كل 20 ثانية لو انقطع السوكيت
        pollTimerRef.current = setInterval(() => {
          if (!socketRef.current?.connected) reloadUserOrders();
        }, 20000);

        // إعداد مستمعي الإشعارات للتحديث اللحظي
        notificationListenersRef.current = attachNotificationListeners(
          () => {}, // لا نحتاج للتنقل هنا
          softRefresh // تحديث الطلبات عند استلام إشعار طلب
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // لا نبدأ إلا بعد authReady لتجنّب وميض الحالة
    if (authReady) bootstrap();

    return () => {
      mounted = false;
      if (socketRef.current) socketRef.current.disconnect();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (notificationListenersRef.current) {
        notificationListenersRef.current.responseSub?.remove();
        notificationListenersRef.current.receiveSub?.remove();
      }
    };
  }, [authReady, isLoggedIn]);

  // سحب للتحديث
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await reloadUserOrders();
    } finally {
      setRefreshing(false);
    }
  };

  // فلترة حسب الشهر
  const monthlyOrders = useMemo(() => {
    // نتوقّع item.date بصيغة "YYYY-MM-DD"؛ وإن لم تتوفّر، نعرض الكل
    return orders.filter((o) => {
      if (!o?.date) return true;
      return String(o.date).startsWith(selectedMonth);
    });
  }, [orders, selectedMonth]);

  // فلترة حسب التصنيف
  const filtered = useMemo(() => {
    return monthlyOrders.filter((o) =>
      selectedCategory === "الكل" ? true : o.category === selectedCategory
    );
  }, [monthlyOrders, selectedCategory]);

  // إحصائيات سريعة للشهر (تُظهر أعلى الشاشة)
  const monthlyStats = useMemo(() => {
    const total = monthlyOrders.length;
    const inProgress = monthlyOrders.filter((o) =>
      ["awaiting_procurement", "preparing"].includes(o.rawStatus ?? "")
    ).length;
    const success = monthlyOrders.filter((o) =>
      ["delivered", "procured"].includes(o.rawStatus ?? "")
    ).length;
    const failed = monthlyOrders.filter((o) =>
      ["returned", "cancelled", "procurement_failed"].includes(
        o.rawStatus ?? ""
      )
    ).length;
    return { total, inProgress, success, failed };
  }, [monthlyOrders]);

  return (
    <View style={styles.screen}>
      {/* هيدر متدرّج + شريط حالة السوكيت */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary, COLORS.primary]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>طلباتي</Text>
            <Text style={styles.headerSub}>سجّل نشاطك الشهري بسهولة</Text>
          </View>

          <SocketStatusIndicator isConnected={socketConnected} />
        </View>

        {/* شريط أدوات: اختيار الشهر + الفلتر */}
        <BlurView intensity={30} tint="dark" style={styles.toolsBar}>
          <TouchableOpacity
            onPress={() => setMonthPickerOpen(true)}
            style={styles.monthSelector}
            activeOpacity={0.9}
          >
            <Ionicons name="calendar" size={18} color="#E6ECF5" />
            <Text style={styles.monthSelectorText}>{selectedMonth}</Text>
            <Ionicons name="chevron-down" size={16} color="#E6ECF5" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categories.map((cat) => (
              <SegmentButton
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </BlurView>

        {/* إحصائيات */}
        <View style={styles.statsRow}>
          <StatCard
            icon="layers"
            label="إجمالي الشهر"
            value={monthlyStats.total}
          />
          <StatCard
            icon="time"
            label="قيد التنفيذ"
            value={monthlyStats.inProgress}
          />
          <StatCard
            icon="checkmark"
            label="مكتمل"
            value={monthlyStats.success}
          />
          <StatCard
            icon="close"
            label="ملغي/راجع"
            value={monthlyStats.failed}
          />
        </View>
      </LinearGradient>

      {/* كارت التنبيه للدخول/التوثيق */}
      {authReady && !isLoggedIn && (
        <AuthNoticeCard
          variant="login"
          onPress={() => getAuthBanner()?.show("login")}
        />
      )}

      {authReady && isLoggedIn && profileVerified === false && (
        <AuthNoticeCard
          variant="verify"
          onPress={() => getAuthBanner()?.show("verify")}
        />
      )}

      {/* قائمة الطلبات */}
      <ScreenStateBoundary
        isLoading={loading}
        isError={!!error}
        isEmpty={filtered.length === 0 && !loading && !error}
        onRetry={reloadUserOrders}
        emptyTitle="لا توجد طلبات"
        emptyDescription="غيّر الشهر المختار أو ابدأ أول طلب لك الآن"
        emptyActionLabel="تغيير الشهر"
        emptyOnAction={() => setMonthPickerOpen(true)}
        errorMessage={error}
        loadingMessage="جارٍ تحميل طلباتك..."
      >
        <FlatList
          data={filtered}
          keyExtractor={(item, idx) =>
            String(item?.id ?? (item as any)?._id ?? `${idx}`)
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<View style={{ height: 8 }} />}
          ListEmptyComponent={
            authReady && !isLoggedIn ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <Text style={styles.emptyTitle}>سجّل الدخول لعرض طلباتك</Text>
                <TouchableOpacity
                  onPress={() => getAuthBanner()?.show("login")}
                  style={[styles.emptyBtn, { marginTop: 10 }]}
                  activeOpacity={0.9}
                >
                  <Ionicons name="log-in-outline" size={16} color="#fff" />
                  <Text style={styles.emptyBtnText}>تسجيل الدخول</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={() => {
                navigation.navigate("OrderDetailsScreen", { order: item });
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.primary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </ScreenStateBoundary>

      {/* Month Picker Modal */}
      <MonthPickerModal
        visible={monthPickerOpen}
        initial={selectedMonth}
        onClose={() => setMonthPickerOpen(false)}
        onSelect={(val) => {
          setSelectedMonth(val);
          setMonthPickerOpen(false);
        }}
      />
    </View>
  );
};

// ——————————————————————————————————
// عناصر واجهة

const SegmentButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(active ? 1 : 0.98)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1 : 0.98,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale }], marginLeft: 8 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={[styles.segment, active && styles.segmentActive]}
      >
        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const OrderCard = ({ item, onPress }: { item: Order; onPress: () => void }) => {
  const tone = statusTone(item.rawStatus);
  const color = toneToColor(tone);
  const prog = statusProgress(item.rawStatus);
  const isUtility = item.kind === "utility";
  const isMarketplace = item.kind === "marketplace";
  const isErrand = item.kind === "errand";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      style={styles.cardWrap}
    >
      {/* شريط تقدّم */}
      <LinearGradient
        colors={[color, color]}
        style={styles.cardProgressBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Animated.View
          style={[
            styles.cardProgressFill,
            { width: `${Math.round(prog * 100)}%` },
          ]}
        />
      </LinearGradient>

      <View style={styles.cardInner}>
        {/* رأس البطاقة */}
        <View style={styles.cardHeaderRow}>
          {isMarketplace ? (
            item.logo ? (
              <Image source={{ uri: item.logo }} style={styles.storeLogo} />
            ) : (
              <View style={[styles.storeLogo, styles.logoFallback]}>
                <Ionicons name="storefront" size={26} color="#BFC6D1" />
              </View>
            )
          ) : isUtility ? (
            <UtilityIcon kind={item.utility?.kind} />
          ) : (
            // اخدمني
            <View style={[styles.storeLogo, styles.errandLogo]}>
              <Ionicons name="bicycle" size={24} color={COLORS.primary} />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.storeName}>
                {isMarketplace
                  ? item.store || "—"
                  : isUtility
                  ? utilityLabel(item.utility?.kind)
                  : "اخدمني"}
              </Text>

              {isErrand && item.source === "shein" && (
                <View style={styles.sheinPill}>
                  <Ionicons name="bag" size={12} color="#fff" />
                  <Text style={styles.sheinPillText}>SHEIN</Text>
                </View>
              )}
            </View>

            {/* التصنيف يظل كما هو من mapOrder: "المتاجر" | "اخدمني" | "الغاز" | "وايت" | "الخدمات" */}
            <Text style={styles.orderCategory}>{item.category}</Text>
          </View>

          <View style={[styles.statusChip, { backgroundColor: color }]}>
            <Ionicons
              name={
                tone === "success"
                  ? "checkmark-done"
                  : tone === "error"
                  ? "close"
                  : "timer"
              }
              size={16}
              color="#fff"
            />
            <Text style={styles.statusChipText}>{item.status}</Text>
          </View>
        </View>

        {/* تفاصيل العنوان/المكان */}
        <View style={styles.cardDivider} />
        <View style={styles.detailsGrid}>
          {isErrand ? (
            <>
              <DetailRow
                icon="navigate"
                text={`من: ${item.errand?.pickupLabel || "—"}`}
              />
              <DetailRow
                icon="flag"
                text={`إلى: ${item.errand?.dropoffLabel || "—"}`}
              />
            </>
          ) : (
            <DetailRow icon="location" text={item.address || "—"} />
          )}

          <DetailRow icon="time" text={`${item.time}  •  ${item.date}`} />
          <DetailRow
            icon="pricetag"
            text={`${item.total.toFixed(1)} ر.ي`}
            bold
            color={COLORS.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DetailRow = ({
  icon,
  text,
  bold,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  bold?: boolean;
  color?: string;
}) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={16} color={color || COLORS.gray} />
    <Text
      style={[
        styles.detailText,
        bold && { fontFamily: "Cairo-Bold" },
        color && { color },
      ]}
      numberOfLines={2}
    >
      {text}
    </Text>
  </View>
);

// ——————————————————————————————————
// Empty / Skeleton

const EmptyState = ({ onChooseMonth }: { onChooseMonth: () => void }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIcon}>
      <Ionicons name="cube-outline" size={36} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
    <Text style={styles.emptySubtitle}>
      غيّر الشهر المختار أو ابدأ أول طلب لك الآن.
    </Text>
    <TouchableOpacity
      onPress={onChooseMonth}
      style={styles.emptyBtn}
      activeOpacity={0.9}
    >
      <Ionicons name="calendar" size={16} color="#fff" />
      <Text style={styles.emptyBtnText}>تغيير الشهر</Text>
    </TouchableOpacity>
  </View>
);

// ——————————————————————————————————
// كارت التنبيه الجاهز للاستخدام
const AuthNoticeCard = ({
  variant,
  onPress,
}: {
  variant: "login" | "verify";
  onPress: () => void;
}) => (
  <View style={styles.noticeWrap}>
    <Ionicons
      name={variant === "login" ? "log-in-outline" : "shield-checkmark-outline"}
      size={18}
      color="#D84315"
    />
    <Text style={styles.noticeText}>
      {variant === "login"
        ? "سجّل الدخول لعرض طلباتك"
        : "وثّق حسابك لإظهار جميع الطلبات وتتبعها"}
    </Text>
    <TouchableOpacity onPress={onPress} style={styles.noticeCta}>
      <Text style={styles.noticeCtaText}>
        {variant === "login" ? "تسجيل الدخول" : "توثيق الآن"}
      </Text>
    </TouchableOpacity>
  </View>
);

const SkeletonList = () => (
  <View style={{ paddingHorizontal: 16 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

const SkeletonCard = () => {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  return (
    <View style={styles.skelCard}>
      <View style={styles.skelHeaderRow}>
        <View style={styles.skelLogo} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.skelLineShort} />
          <View style={styles.skelLineLong} />
        </View>
        <View style={styles.skelChip} />
      </View>
      <View style={styles.skelDivider} />
      <View style={{ gap: 8, marginTop: 6 }}>
        <View style={styles.skelLineLong} />
        <View style={styles.skelLineMid} />
      </View>
      <Animated.View
        style={[
          styles.skelShimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// ——————————————————————————————————
// Month Picker (بسيط بدون مكتبات إضافية)

const MonthPickerModal = ({
  visible,
  initial,
  onClose,
  onSelect,
}: {
  visible: boolean;
  initial: string; // "YYYY-MM"
  onClose: () => void;
  onSelect: (val: string) => void;
}) => {
  const [year, setYear] = useState<number>(() => Number(initial.split("-")[0]));
  const [month, setMonth] = useState<number>(() =>
    Number(initial.split("-")[1])
  );

  useEffect(() => {
    if (!visible) return;
    setYear(Number(initial.split("-")[0]));
    setMonth(Number(initial.split("-")[1]));
  }, [visible, initial]);

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setYear((y) => y - 1)}
              style={styles.modalIconBtn}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{year}</Text>
            <TouchableOpacity
              onPress={() => setYear((y) => y + 1)}
              style={styles.modalIconBtn}
            >
              <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {months.map((m) => {
              const active = Number(m) === month;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthCell, active && styles.monthCellActive]}
                  onPress={() => setMonth(Number(m))}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.monthCellText,
                      active && styles.monthCellTextActive,
                    ]}
                  >
                    {`${year}-${m}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() =>
              onSelect(`${year}-${String(month).padStart(2, "0")}`)
            }
            style={styles.modalConfirmBtn}
            activeOpacity={0.95}
          >
            <Text style={styles.modalConfirmText}>اعتماد</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ——————————————————————————————————
// الأنماط

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingTop: 22,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitleWrap: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#ffffff",
  },
  headerSub: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "#E6ECF5",
    marginTop: 2,
  },
  socketPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  socketDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  socketText: {
    color: "#fff",
    fontFamily: "Cairo-SemiBold",
    fontSize: 12,
  },

  toolsBar: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  monthSelector: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 8,
  },
  monthSelectorText: {
    color: "#E6ECF5",
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
  },

  categoriesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 2,
  },
  segment: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  segmentText: {
    color: "#E6ECF5",
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
  },
  segmentTextActive: {
    color: COLORS.blue,
  },

  statsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statIconWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 6,
    alignSelf: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  statValue: {
    color: "#fff",
    fontFamily: "Cairo-Black",
    fontSize: 18,
    textAlign: "center",
  },
  statLabel: {
    color: "#E6ECF5",
    fontFamily: "Cairo-Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },

  // List
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  // Card
  cardWrap: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardProgressBar: { height: 4, backgroundColor: "#f1f1f1" },
  cardProgressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  cardInner: { padding: 14 },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  storeLogo: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: "#fff",
  },
  logoFallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  errandLogo: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff6f0",
    borderColor: "#FFDCC7",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeName: { fontFamily: "Cairo-Bold", fontSize: 16, color: COLORS.text },
  orderCategory: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusChipText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 12 },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },
  detailsGrid: { gap: 8 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: "#4A5668",
  },

  sheinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6A1B9A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sheinPillText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    fontSize: 16,
  },
  emptySubtitle: {
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyBtnText: {
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 12,
  },

  // Skeleton
  skelCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginTop: 12,
    padding: 14,
    overflow: "hidden",
  },
  skelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skelLogo: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#EEF1F6",
  },
  skelLineShort: {
    height: 12,
    width: "40%",
    backgroundColor: "#EEF1F6",
    borderRadius: 8,
  },
  skelLineLong: {
    height: 12,
    width: "75%",
    backgroundColor: "#EEF1F6",
    borderRadius: 8,
  },
  skelLineMid: {
    height: 12,
    width: "55%",
    backgroundColor: "#EEF1F6",
    borderRadius: 8,
  },
  skelChip: {
    width: 70,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#EEF1F6",
  },
  skelDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },
  skelShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ rotate: "12deg" }],
    opacity: 0.4,
  },

  // Month Picker
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalIconBtn: {
    backgroundColor: "#F2F4F7",
    padding: 8,
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.text,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  monthCell: {
    width: "31.8%",
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#EEF1F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  monthCellActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  monthCellText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    fontSize: 13,
  },
  monthCellTextActive: {
    color: "#fff",
  },
  modalConfirmBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  modalConfirmText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Cairo-Bold",
    fontSize: 14,
  },

  // Auth Notice Card
  noticeWrap: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    color: "#333",
    fontFamily: "Cairo-Regular",
    fontSize: 13,
  },
  noticeCta: {
    backgroundColor: "#D84315",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  noticeCtaText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 12 },
});

export default MyOrdersScreen;
