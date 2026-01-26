import { fetchUserProfile } from "@/api/userApi";
import { calculateErrandFee, createErrand } from "@/api/akhdimniApi";
import { useAuth } from "@/auth/AuthContext";
import { getAuthBanner } from "@/guards/bannerGateway";

import COLORS from "@/constants/colors";
import { RootStackParamList } from "@/types/navigation";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* -------------------- Types & constants (restored) -------------------- */
type ErrandCategory =
  | "docs"
  | "parcel"
  | "groceries"
  | "carton"
  | "food"
  | "fragile"
  | "other";

type ErrandSize = "small" | "medium" | "large";
type PayMethod = "wallet" | "cash" | "card" | "mixed";

interface PointLocation {
  lat: number | null;
  lng: number | null;
}
interface ErrandPoint {
  label?: string;
  street?: string;
  city?: string;
  contactName?: string;
  phone?: string;
  location: PointLocation;
}
interface Waypoint {
  label?: string;
  location: { lat: number; lng: number };
}
interface ErrandForm {
  category: ErrandCategory;
  size?: ErrandSize;
  weightKg?: string;
  description?: string;
  pickup: ErrandPoint;
  dropoff: ErrandPoint;
  waypoints: Waypoint[];
  tip: string;
  scheduledFor?: string | null;
  paymentMethod: PayMethod;
  notes?: string;
}

const initialForm: ErrandForm = {
  category: "other",
  size: "small",
  weightKg: "",
  description: "",
  pickup: {
    label: "",
    street: "",
    city: "",
    contactName: "",
    phone: "",
    location: { lat: null, lng: null },
  },
  dropoff: {
    label: "",
    street: "",
    city: "",
    contactName: "",
    phone: "",
    location: { lat: null, lng: null },
  },
  waypoints: [],
  tip: "",
  scheduledFor: null,
  paymentMethod: "wallet",
  notes: "",
};

const CATS = [
  { key: "docs", label: "مستندات", icon: "description" },
  { key: "parcel", label: "طرود", icon: "inbox" },
  { key: "groceries", label: "مقاضي", icon: "local-grocery-store" },
  { key: "carton", label: "كرتون", icon: "inventory" },
  { key: "food", label: "ماكولات", icon: "restaurant" },
  { key: "fragile", label: "قابله للكسر", icon: "warning" },
  { key: "other", label: "أخرى", icon: "category" },
] as const;

const SIZES = [
  { key: "small", label: "صغير" },
  { key: "medium", label: "متوسط" },
  { key: "large", label: "كبير" },
] as const;

const PAY_METHODS: { key: PayMethod; label: string; icon: string }[] = [
  { key: "wallet", label: "محفظة", icon: "account-balance-wallet" },
  { key: "cash", label: "كاش", icon: "attach-money" },
  { key: "card", label: "بطاقة", icon: "credit-card" },
  { key: "mixed", label: "مختلط", icon: "sync-alt" },
];

/* -------------------- Helpers -------------------- */
function haversineKm(a: PointLocation, b: PointLocation): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null)
    return null;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad((b.lat as number) - (a.lat as number));
  const dLng = toRad((b.lng as number) - (a.lng as number));
  const lat1 = toRad(a.lat as number);
  const lat2 = toRad(b.lat as number);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function fmtTime(h: number, m: number) {
  const ampm = h < 12 ? "ص" : "م";
  const h12 = ((h + 11) % 12) + 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${h12}:${pad(m)} ${ampm}`;
}
function toLocalIso(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
function dayTitle(offset: number, d: Date) {
  const wd = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ][d.getDay()];
  if (offset === 0) return `اليوم (${wd})`;
  if (offset === 1) return `غدًا (${wd})`;
  return `${wd} ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
function buildSlots(dayOffset: number) {
  const now = new Date();
  const base = new Date(now);
  base.setHours(8, 0, 0, 0);
  base.setDate(base.getDate() + dayOffset);
  if (dayOffset === 0) {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() + 45, 0, 0);
    const remainder = t.getMinutes() % 30;
    if (remainder !== 0) t.setMinutes(t.getMinutes() + (30 - remainder));
    if (t > base) base.setHours(t.getHours(), t.getMinutes(), 0, 0);
  }
  const end = new Date(base);
  end.setHours(22, 0, 0, 0);
  const slots: {
    label: string;
    isoLocal: string;
    hour: number;
    min: number;
  }[] = [];
  const cur = new Date(base);
  while (cur <= end) {
    slots.push({
      label: fmtTime(cur.getHours(), cur.getMinutes()),
      isoLocal: toLocalIso(cur),
      hour: cur.getHours(),
      min: cur.getMinutes(),
    });
    cur.setMinutes(cur.getMinutes() + 30);
  }
  return slots;
}

/* -------------------- Small UI primitives -------------------- */
const Field = ({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>
      {label}{" "}
      {required ? <Text style={{ color: COLORS.primary }}>*</Text> : null}
    </Text>
    {children}
  </View>
);
const Row = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.row}>{children}</View>
);

type Option<T extends string> = { value: T; label: string; icon?: string };
function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = "اختر…",
}: {
  label: string;
  value?: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.select} onPress={() => setOpen(true)}>
        <View
          style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}
        >
          {current?.icon ? (
            <Icon name={current.icon as any} size={18} color={COLORS.blue} />
          ) : null}
          <Text style={[styles.selectText, !current && { color: "#999" }]}>
            {current?.label || placeholder}
          </Text>
        </View>
        <Icon name="expand-more" size={20} color={COLORS.blue} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((o) => (
              <Pressable
                key={o.value}
                style={styles.optionRow}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <View
                  style={{
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {o.icon ? (
                    <Icon name={o.icon as any} size={18} color={COLORS.blue} />
                  ) : null}
                  <Text style={styles.optionText}>{o.label}</Text>
                </View>
                {value === o.value ? (
                  <Icon
                    name="radio-button-checked"
                    size={18}
                    color={COLORS.primary}
                  />
                ) : (
                  <Icon name="radio-button-unchecked" size={18} color="#bbb" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function SchedulePicker({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (isoLocalOrNull: string | null) => void;
}) {
  const [mode, setMode] = useState<"now" | "later">(value ? "later" : "now");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<string | null>(value || null);

  const today = new Date();
  const day0 = new Date(today);
  const day1 = new Date(today);
  day1.setDate(day1.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const tabs: { title: string; slots: ReturnType<typeof buildSlots> }[] = [
    { title: dayTitle(0, day0), slots: buildSlots(0) },
    { title: dayTitle(1, day1), slots: buildSlots(1) },
    { title: dayTitle(2, day2), slots: buildSlots(2) },
  ];

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>وقت التنفيذ</Text>

      <View style={styles.toggleWrap}>
        {(["now", "later"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setMode(t);
              if (t === "now") onChange(null);
              else setOpen(true);
            }}
            style={[styles.toggleBtn, mode === t && styles.toggleBtnActive]}
          >
            <Text
              style={[styles.toggleText, mode === t && styles.toggleTextActive]}
            >
              {t === "now" ? "الآن" : "جدولة"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "later" && (
        <Pressable style={styles.select} onPress={() => setOpen(true)}>
          <Text style={[styles.selectText, !selected && { color: "#999" }]}>
            {selected ? selected.replace("T", " ") : "اختر موعد التنفيذ"}
          </Text>
          <Icon name="event" size={20} color={COLORS.blue} />
        </Pressable>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={[styles.modalSheet, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>جدولة المشوار</Text>

            <View style={styles.tabsRow}>
              {[0, 1, 2].map((i) => (
                <Pressable
                  key={i}
                  style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
                  onPress={() => setTab(i as 0 | 1 | 2)}
                >
                  <Text
                    style={[styles.tabText, tab === i && styles.tabTextActive]}
                  >
                    {tabs[i].title}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              <View style={styles.slotsGrid}>
                {tabs[tab].slots.map((s) => (
                  <Pressable
                    key={s.isoLocal}
                    onPress={() => setSelected(s.isoLocal)}
                    style={[
                      styles.slotChip,
                      selected === s.isoLocal && styles.slotChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selected === s.isoLocal && styles.slotTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row-reverse", gap: 8 }}>
              <Pressable
                style={[styles.btn, { flex: 1 }]}
                onPress={() => {
                  if (!selected) return;
                  onChange(selected);
                  setOpen(false);
                }}
              >
                <Text style={styles.btnText}>تأكيد الموعد</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnGhost, { flex: 1 }]}
                onPress={() => {
                  setSelected(null);
                  onChange(null);
                  setMode("now");
                  setOpen(false);
                }}
              >
                <Text style={styles.btnGhostText}>إلغاء الجدولة</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* -------------------- Stepper -------------------- */
const STEPS = [
  { key: "specs", title: "المواصفات", icon: "tune" as const },
  { key: "pickup", title: "الاستلام", icon: "place" as const },
  { key: "dropoff", title: "التسليم", icon: "flag" as const },
  { key: "pay", title: "الدفع والجدولة", icon: "payments" as const },
  { key: "review", title: "المراجعة والتأكيد", icon: "check-circle" as const },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

function StepperHeader({ step }: { step: number }) {
  const isRTL = I18nManager.isRTL; // 👈 RTL?
  const total = STEPS.length;

  // 👇 ما نعرضه فعليًا: نعكس فقط في RTL
  const display = isRTL ? [...STEPS].reverse() : STEPS;

  // 👇 أي خطوة نشطة بصريًا بعد العكس
  const visualIndex = isRTL ? total - 1 - step : step;

  // 👇 نسبة التقدّم بناءً على الفهرس البصري
  const progress = ((visualIndex + 1) / total) * 100;

  return (
    <View style={stylesStepper.wrap}>
      <View style={stylesStepper.row}>
        {display.map((s, i) => {
          const done = i < visualIndex;
          const isActive = i === visualIndex;
          return (
            <React.Fragment key={s.key}>
              <View style={stylesStepper.item}>
                <View
                  style={[
                    stylesStepper.dot,
                    done && stylesStepper.dotDone,
                    isActive && stylesStepper.dotActive,
                  ]}
                >
                  <Icon
                    name={done ? "check" : s.icon}
                    size={14}
                    color={done ? "#fff" : isActive ? "#fff" : COLORS.blue}
                  />
                </View>
                <Text
                  style={[
                    stylesStepper.title,
                    (done || isActive) && stylesStepper.titleActive,
                  ]}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
              </View>

              {i !== total - 1 ? (
                <View
                  style={[
                    stylesStepper.line,
                    i < visualIndex && stylesStepper.lineActive,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>

      {/* شريط تقدّم يملأ من اليمين إذا RTL */}
      <View
        style={[
          stylesStepper.progressBarBg,
          isRTL && { transform: [{ scaleX: -1 }] }, // يعكس اتجاه الامتلاء بصريًا
        ]}
      >
        <View
          style={[stylesStepper.progressBarFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

/* -------------------- Screen -------------------- */
type ScreenProps = NativeStackScreenProps<RootStackParamList, "AkhdimniScreen">;

const AkhdimniScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [form, setForm] = useState<ErrandForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [estimate, setEstimate] = useState<{
    distanceKm?: number | null;
    deliveryFee?: number | null;
    totalWithTip?: number | null;
  }>({});
  const isFocused = useIsFocused();
  const { isLoggedIn, authReady } = useAuth();
  const requireAuth = () => {
    if (authReady && !isLoggedIn) {
      getAuthBanner()?.show("login");
      return false;
    }
    return true;
  };
  const [step, setStep] = useState<number>(0);
  const totalSteps = STEPS.length;
  const scrollRef = useRef<ScrollView>(null);

  const localDistanceKm = useMemo(
    () => haversineKm(form.pickup.location, form.dropoff.location),
    [form.pickup.location, form.dropoff.location]
  );

  const handleSet = <K extends keyof ErrandForm>(
    key: K,
    value: ErrandForm[K]
  ) => setForm((s) => ({ ...s, [key]: value }));
  const handlePoint = (
    which: "pickup" | "dropoff",
    key: keyof ErrandPoint,
    value: any
  ) => setForm((s) => ({ ...s, [which]: { ...s[which], [key]: value } }));

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      try {
        const [pStr, dStr] = await Promise.all([
          AsyncStorage.getItem("akhdimni_pickup"),
          AsyncStorage.getItem("akhdimni_dropoff"),
        ]);
        if (pStr) {
          const p = JSON.parse(pStr);
          handlePoint("pickup", "location", { lat: p.lat, lng: p.lng });
          if (!form.pickup.label)
            handlePoint(
              "pickup",
              "label",
              (p.address || "").split(",").slice(0, 2).join("، ")
            );
          await AsyncStorage.removeItem("akhdimni_pickup");
        }
        if (dStr) {
          const d = JSON.parse(dStr);
          handlePoint("dropoff", "location", { lat: d.lat, lng: d.lng });
          if (!form.dropoff.label)
            handlePoint(
              "dropoff",
              "label",
              (d.address || "").split(",").slice(0, 2).join("، ")
            );
          await AsyncStorage.removeItem("akhdimni_dropoff");
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  async function useDefaultAddressAsDropoff() {
    if (!requireAuth()) return;
    try {
      const user = await fetchUserProfile().catch(() => null);
      const defId = user?.defaultAddressId;
      const addr = user?.addresses?.find((a: any) => a._id === defId) || null;
      if (!addr) return Alert.alert("تنبيه", "لا يوجد عنوان افتراضي");
      handlePoint("dropoff", "label", addr.label);
      handlePoint("dropoff", "city", addr.city);
      handlePoint("dropoff", "street", addr.street);
      if (addr.location)
        handlePoint("dropoff", "location", {
          lat: addr.location.lat,
          lng: addr.location.lng,
        });
    } catch {
      Alert.alert("خطأ", "تعذر قراءة العنوان الافتراضي");
    }
  }

  async function fetchEstimate() {
    if (!canEstimate) {
      return Alert.alert(
        "بيانات ناقصة",
        "الرجاء تحديد إحداثيات الاستلام والتسليم."
      );
    }

    // ضيف؟ اعمل fallback محلي مباشرة وأظهر البانر
    if (!requireAuth()) {
      const dist = localDistanceKm ?? 0;
      const base = 300,
        perKm = 120;
      const fee = Math.max(base, base + perKm * Math.max(0, dist - 1));
      const tipNum = form.tip ? Number(form.tip) : 0;
      setEstimate({
        distanceKm: dist,
        deliveryFee: Math.round(fee),
        totalWithTip: Math.round(fee + tipNum),
      });
      return;
    }

    setFeeLoading(true);
    try {
      const data = await calculateErrandFee({
        category: form.category,
        size: form.size || "small",
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
      setEstimate({
        distanceKm: data.distanceKm ?? localDistanceKm ?? null,
        deliveryFee: data.deliveryFee ?? null,
        totalWithTip: data.totalWithTip ?? null,
      });
    } catch {
      const dist = localDistanceKm ?? 0;
      const base = 300,
        perKm = 120;
      const fee = Math.max(base, base + perKm * Math.max(0, dist - 1));
      const tipNum = form.tip ? Number(form.tip) : 0;
      setEstimate({
        distanceKm: dist,
        deliveryFee: Math.round(fee),
        totalWithTip: Math.round(fee + tipNum),
      });
    } finally {
      setFeeLoading(false);
    }
  }

  async function submitOrder() {
    if (!canEstimate) {
      return Alert.alert(
        "بيانات ناقصة",
        "الرجاء تحديد إحداثيات الاستلام والتسليم."
      );
    }
    if (!requireAuth()) return; // ✅ بانر للضيف ووقف

    setBusy(true);
    try {
      const payload = {
        category: form.category,
        description: form.description?.trim() || undefined,
        size: form.size || "small",
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        pickup: {
          ...form.pickup,
          location: {
            lat: form.pickup.location.lat!,
            lng: form.pickup.location.lng!,
          },
        },
        dropoff: {
          ...form.dropoff,
          location: {
            lat: form.dropoff.location.lat!,
            lng: form.dropoff.location.lng!,
          },
        },
        waypoints: form.waypoints,
        tip: form.tip ? Number(form.tip) : 0,
        scheduledFor: form.scheduledFor
          ? new Date(form.scheduledFor).toISOString()
          : null,
        paymentMethod: form.paymentMethod,
        notes: form.notes?.trim() || undefined,
      };
      const order = await createErrand(payload);
      Alert.alert("تم إنشاء الطلب", `رقم الطلب: ${order.orderNumber || order._id}`);
      navigation.navigate("OrderDetailsScreen" as any, { order });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "حدث خطأ غير متوقع";
      Alert.alert("خطأ", msg);
    } finally {
      setBusy(false);
    }
  }

  // تحقّق لكل خطوة
  const isSpecsValid = !!form.category && !!form.size;
  const isPickupValid =
    form.pickup.location.lat != null && form.pickup.location.lng != null;
  const isDropoffValid =
    form.dropoff.location.lat != null && form.dropoff.location.lng != null;
  const isPayValid = !!form.paymentMethod;
  const canEstimate = isPickupValid && isDropoffValid;

  function isStepValid(i: number) {
    switch (STEPS[i].key) {
      case "specs":
        return isSpecsValid;
      case "pickup":
        return isPickupValid;
      case "dropoff":
        return isDropoffValid;
      case "pay":
        return isPayValid;
      case "review":
        return canEstimate;
      default:
        return false;
    }
  }

  function onNext() {
    if (!isStepValid(step))
      return Alert.alert("بيانات ناقصة", "أكمل الحقول المطلوبة قبل المتابعة.");

    // لو هنوصل لخطوة "review" أو بننهي بتأكيد الطلب، اطلب تسجيل الدخول
    const isGoingToSubmit = step >= STEPS.length - 1;
    if (isGoingToSubmit && !requireAuth()) return;

    if (step < totalSteps - 1) setStep((s) => s + 1);
    else submitOrder();
  }

  function onBack() {
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  }

  // محتوى كل خطوة
  function renderStepContent() {
    const key: StepKey = STEPS[step].key;
    switch (key) {
      case "specs":
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>المواصفات</Text>
            <SelectField<ErrandCategory>
              label="نوع الغرض"
              value={form.category}
              onChange={(v) => handleSet("category", v)}
              options={CATS.map((c) => ({
                value: c.key as ErrandCategory,
                label: c.label,
                icon: c.icon,
              }))}
            />
            <SelectField<ErrandSize>
              label="الحجم"
              value={form.size}
              onChange={(v) => handleSet("size", v)}
              options={SIZES.map((s) => ({
                value: s.key as ErrandSize,
                label: s.label,
              }))}
            />
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="الوزن (كجم)">
                  <TextInput
                    value={form.weightKg}
                    onChangeText={(t) => handleSet("weightKg", t)}
                    keyboardType="decimal-pad"
                    placeholder="اختياري"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="وصف مختصر">
                  <TextInput
                    value={form.description}
                    onChangeText={(t) => handleSet("description", t)}
                    placeholder="مثال: ظرف مستندات"
                    style={styles.input}
                  />
                </Field>
              </View>
            </Row>
          </View>
        );

      case "pickup":
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>الاستلام</Text>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="وصف/ملصق">
                  <TextInput
                    value={form.pickup.label}
                    onChangeText={(t) => handlePoint("pickup", "label", t)}
                    placeholder="مثال: مكتب الطباعة - حدة"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <TouchableOpacity
                style={[styles.smallBtn, { alignSelf: "flex-end" }]}
                onPress={() =>
                  navigation.navigate("SelectLocation", {
                    storageKey: "akhdimni_pickup",
                    title: "اختر موقع الاستلام",
                  })
                }
              >
                <Icon name="place" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>
                  {form.pickup.location.lat
                    ? "تم التحديد"
                    : "اختيار من الخريطة"}
                </Text>
              </TouchableOpacity>
            </Row>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="المدينة">
                  <TextInput
                    value={form.pickup.city}
                    onChangeText={(t) => handlePoint("pickup", "city", t)}
                    placeholder="صنعاء"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="الشارع">
                  <TextInput
                    value={form.pickup.street}
                    onChangeText={(t) => handlePoint("pickup", "street", t)}
                    placeholder="مثال: الزبيري"
                    style={styles.input}
                  />
                </Field>
              </View>
            </Row>
          </View>
        );

      case "dropoff":
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>التسليم</Text>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="وصف/ملصق">
                  <TextInput
                    value={form.dropoff.label}
                    onChangeText={(t) => handlePoint("dropoff", "label", t)}
                    placeholder="مثال: بيت العميل - شارع تونس"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <TouchableOpacity
                style={[styles.smallBtn, { alignSelf: "flex-end" }]}
                onPress={() =>
                  navigation.navigate("SelectLocation", {
                    storageKey: "akhdimni_dropoff",
                    title: "اختر موقع التسليم",
                  })
                }
              >
                <Icon name="place" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>
                  {form.dropoff.location.lat
                    ? "تم التحديد"
                    : "اختيار من الخريطة"}
                </Text>
              </TouchableOpacity>
            </Row>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="المدينة">
                  <TextInput
                    value={form.dropoff.city}
                    onChangeText={(t) => handlePoint("dropoff", "city", t)}
                    placeholder="صنعاء"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="الشارع">
                  <TextInput
                    value={form.dropoff.street}
                    onChangeText={(t) => handlePoint("dropoff", "street", t)}
                    placeholder="مثال: الجزائر"
                    style={styles.input}
                  />
                </Field>
              </View>
            </Row>

            <Row>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost, { flex: 1 }]}
                onPress={useDefaultAddressAsDropoff}
              >
                <Text style={styles.btnGhostText}>
                  استخدام العنوان الافتراضي للتسليم
                </Text>
              </TouchableOpacity>
            </Row>

            <View style={styles.inlineInfo}>
              <Icon name="straighten" size={16} color={COLORS.blue} />
              <Text style={styles.inlineInfoText}>
                المسافة التقريبية:{" "}
                {localDistanceKm != null
                  ? `${localDistanceKm.toFixed(2)} كم`
                  : "—"}
              </Text>
            </View>
          </View>
        );

      case "pay":
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>الدفع والجدولة</Text>
            <SelectField<PayMethod>
              label="طريقة الدفع"
              value={form.paymentMethod}
              onChange={(v) => handleSet("paymentMethod", v)}
              options={PAY_METHODS.map((p) => ({
                value: p.key,
                label: p.label,
                icon: p.icon,
              }))}
            />
            <SchedulePicker
              value={form.scheduledFor}
              onChange={(d) => handleSet("scheduledFor", d)}
            />
            <Row>
              <View style={{ flex: 1 }}>
                <Field label="بقشيش (اختياري)">
                  <TextInput
                    value={form.tip}
                    onChangeText={(t) => handleSet("tip", t)}
                    placeholder="0"
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="ملاحظات (اختياري)">
                  <TextInput
                    value={form.notes}
                    onChangeText={(t) => handleSet("notes", t)}
                    placeholder="أي تفاصيل إضافية للسائق/الدعم"
                    style={[styles.input, { height: 44 }]}
                  />
                </Field>
              </View>
            </Row>
          </View>
        );

      case "review":
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>مراجعة الطلب</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>النوع/الحجم</Text>
                  <Text style={styles.estimateValue}>
                    {CATS.find((c) => c.key === form.category)?.label} —{" "}
                    {SIZES.find((s) => s.key === form.size)?.label}
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>الاستلام</Text>
                  <Text style={styles.estimateValue}>
                    {form.pickup.label || "—"}{" "}
                    {form.pickup.city ? `• ${form.pickup.city}` : ""}
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>التسليم</Text>
                  <Text style={styles.estimateValue}>
                    {form.dropoff.label || "—"}{" "}
                    {form.dropoff.city ? `• ${form.dropoff.city}` : ""}
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>الدفع</Text>
                  <Text style={styles.estimateValue}>
                    {
                      PAY_METHODS.find((p) => p.key === form.paymentMethod)
                        ?.label
                    }
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>الجدولة</Text>
                  <Text style={styles.estimateValue}>
                    {form.scheduledFor
                      ? form.scheduledFor.replace("T", " ")
                      : "الآن"}
                  </Text>
                </View>
                {!!form.tip && (
                  <View style={styles.estimateRow}>
                    <Text style={styles.estimateLabel}>بقشيش</Text>
                    <Text style={styles.estimateValue}>{form.tip} ريال</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: "#fafafa" }]}>
              <Row>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1 }]}
                  onPress={fetchEstimate}
                  disabled={feeLoading || !canEstimate}
                >
                  {feeLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>احسب السعر</Text>
                  )}
                </TouchableOpacity>
              </Row>
              <View style={{ height: 8 }} />
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>المسافة</Text>
                <Text style={styles.estimateValue}>
                  {estimate.distanceKm != null
                    ? `${estimate.distanceKm.toFixed(2)} كم`
                    : localDistanceKm != null
                    ? `${localDistanceKm.toFixed(2)} كم (محلي)`
                    : "—"}
                </Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>رسوم التوصيل</Text>
                <Text style={styles.estimateValue}>
                  {estimate.deliveryFee != null
                    ? `${estimate.deliveryFee} ريال`
                    : "—"}
                </Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>الإجمالي مع البقشيش</Text>
                <Text style={styles.estimateValue}>
                  {estimate.totalWithTip != null
                    ? `${estimate.totalWithTip} ريال`
                    : "—"}
                </Text>
              </View>
            </View>
          </>
        );
    }
  }

  const isLast = step === totalSteps - 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back-ios" size={20} color={COLORS.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سند — إنشاء طلب</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stepper */}
      <StepperHeader step={step} />

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.container, { paddingTop: 0 }]}
      >
        {renderStepContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={stylesStepper.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost, { flex: 1 }]}
          onPress={onBack}
        >
          <Text style={styles.btnGhostText}>
            {step === 0 ? "عودة" : "رجوع"}
          </Text>
        </TouchableOpacity>
        <View style={{ width: 10 }} />
        <TouchableOpacity
          style={[
            styles.btn,
            { flex: 2, opacity: isStepValid(step) ? 1 : 0.6 },
          ]}
          onPress={onNext}
          disabled={busy || !isStepValid(step)}
        >
          {busy && isLast ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {isLast ? "تأكيد الطلب" : "التالي"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AkhdimniScreen;

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { padding: 14, paddingBottom: 36 },
  header: {
    height: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  headerTitle: { color: COLORS.blue, fontFamily: "Cairo-Bold", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(10,47,92,0.08)",
  },
  sectionTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    fontFamily: "Cairo-Regular",
    color: "#222",
    fontSize: 12,
    backgroundColor: "#fff",
  },
  // Select
  select: {
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontFamily: "Cairo-Regular", color: "#222", fontSize: 12 },
  // Toggle Now/Later
  toggleWrap: { flexDirection: "row", gap: 8, marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: { fontFamily: "Cairo-Bold", color: COLORS.blue, fontSize: 12 },
  toggleTextActive: { color: "#fff" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 16,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    fontSize: 14,
    marginBottom: 4,
  },
  optionRow: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  optionText: { fontFamily: "Cairo-Regular", color: "#222", fontSize: 13 },
  // Tabs + slots
  tabsRow: { flexDirection: "row", gap: 8 },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    fontSize: 12,
    textAlign: "center",
  },
  tabTextActive: { color: "#fff" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
  },
  slotChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: { fontFamily: "Cairo-Bold", fontSize: 12, color: COLORS.blue },
  slotTextActive: { color: "#fff" },

  inlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  inlineInfoText: {
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    fontSize: 12,
  },

  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  btnText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 14 },
  btnGhost: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnGhostText: {
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    fontSize: 12,
  },
  smallBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallBtnText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 12 },

  estimateRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  estimateLabel: { fontFamily: "Cairo-Regular", color: "#555", fontSize: 12 },
  estimateValue: { fontFamily: "Cairo-Bold", color: COLORS.blue, fontSize: 12 },
});

const stylesStepper = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  item: { alignItems: "center", width: 70 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dotDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  title: {
    fontFamily: "Cairo-Regular",
    fontSize: 10,
    color: "#6b7a90",
    marginTop: 6,
    textAlign: "center",
  },
  titleActive: { color: COLORS.blue, fontFamily: "Cairo-Bold" },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(10,47,92,0.12)",
    marginHorizontal: 4,
    marginBottom: 18,
  },
  lineActive: { backgroundColor: COLORS.primary },
  progressBarBg: {
    height: 3,
    backgroundColor: "rgba(10,47,92,0.08)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 6,
  },
  progressBarFill: { height: 3, backgroundColor: COLORS.primary },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row-reverse",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(10,47,92,0.08)",
  },
});
