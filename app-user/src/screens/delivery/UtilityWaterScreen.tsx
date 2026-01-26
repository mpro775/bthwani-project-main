// screens/Utility/UtilityWaterScreen.tsx
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { getAuthBanner } from "@/guards/bannerGateway";
import { RootStackParamList } from "@/types/navigation";
import axiosInstance from "@/utils/api/axiosInstance";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import IonIcon from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UtilityWaterScreen"
>;

type Address = {
  _id: string;
  label: string;
  street?: string;
  city: string;
  location: { lat: number; lng: number };
};

type WaterSizeKey = "small" | "medium" | "large";
type UtilityOptionsResp = {
  city: string;
  gas: any;
  water: null | {
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
};

const Chip = ({
  active,
  label,
  onPress,
  icon,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon ? <View style={{ marginRight: 6 }}>{icon}</View> : null}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const Radio = ({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.radioRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.radioOuter, checked && styles.radioOuterChecked]}>
      {checked ? <View style={styles.radioInner} /> : null}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const Stepper = ({
  value,
  setValue,
  min = 1,
  max = 20,
}: {
  value: number;
  setValue: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <View style={styles.stepper}>
    <TouchableOpacity
      style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
      disabled={value <= min}
      onPress={() => setValue(Math.max(min, value - 1))}
    >
      <Icon
        name="remove"
        size={20}
        color={value <= min ? "#bbb" : COLORS.primary}
      />
    </TouchableOpacity>
    <Text style={styles.stepValue}>{value}</Text>
    <TouchableOpacity
      style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
      disabled={value >= max}
      onPress={() => setValue(Math.min(max, value + 1))}
    >
      <Icon
        name="add"
        size={20}
        color={value >= max ? "#bbb" : COLORS.primary}
      />
    </TouchableOpacity>
  </View>
);

const UtilityWaterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isLoggedIn, authReady } = useAuth();

  const requireAuth = () => {
    if (authReady && !isLoggedIn) {
      getAuthBanner()?.show("login"); // أو "verify" حسب السيناريو
      return false;
    }
    return true;
  };

  const [profileLoading, setProfileLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<UtilityOptionsResp | null>(null);

  const [size, setSize] = useState<WaterSizeKey | null>(null);
  const [half, setHalf] = useState(false);
  const [qty, setQty] = useState(1);
  const [pm, setPM] = useState<"cash" | "wallet" | "card" | "mixed">("cash");
  const [notes, setNotes] = useState("");
  const [scheduledMode, setScheduledMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState<string>("");

  const [addrModal, setAddrModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1) Load profile addresses
  useEffect(() => {
    (async () => {
      try {
        setProfileLoading(true);

        // ✅ ضيف؟ لا ننادي API ونظهر بانر
        if (authReady && !isLoggedIn) {
          getAuthBanner()?.show("login");
          setAddresses([]);
          setSelectedAddressId(null);
          return;
        }

        const user = await fetchUserProfile();
        const addrs: Address[] = (user?.addresses || []).map((a: any) => ({
          _id: a._id,
          label: a.label,
          street: a.street,
          city: a.city,
          location: a.location,
        }));
        setAddresses(addrs);
        const defaultId = user?.defaultAddressId || addrs?.[0]?._id || null;
        setSelectedAddressId(defaultId);
      } catch (e) {
        console.error(e);
        Alert.alert("عنوانك", "فشل تحميل العناوين.");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [authReady, isLoggedIn]);

  // 2) Fetch options
  useEffect(() => {
    (async () => {
      try {
        if (!selectedAddress?.city) return;
        setLoading(true);

        // ✅ بدال fetch
        const { data } = await axiosInstance.get<UtilityOptionsResp>(
          "/utility/options",
          { params: { city: selectedAddress.city } }
        );

        setOptions(data);

        // ترتيب المقاسات + اختيار أول حجم
        const order: WaterSizeKey[] = ["small", "medium", "large"];
        if (data?.water?.sizes?.length) {
          data.water.sizes = order
            .map((k) => data.water!.sizes.find((s) => s.key === k))
            .filter(Boolean) as any;
          setOptions({ ...data });
        }
        setSize(data?.water?.sizes?.[0]?.key || null);

        if (!data?.water?.allowHalf) setHalf(false);
      } catch (e) {
        console.error(e);
        Alert.alert("التسعير", "لا توجد إعدادات تسعير لهذه المدينة.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedAddress?.city]);

  const currentSize = useMemo(
    () => options?.water?.sizes.find((s) => s.key === size) || null,
    [options?.water?.sizes, size]
  );

  // ✅ للعرض فقط (السيرفر هو المرجع النهائي)
  // - linear: نصف السعر
  // - multiplier: 60% (افتراضي)
  // - fixed: لا نعرض رقم كي لا يكون مضلل؛ نظهر "—"
  const displayUnitPrice = useMemo(() => {
    if (!currentSize) return 0;

    // كامل الوايت:
    if (!half) return Math.ceil(currentSize.pricePerTanker || 0);

    // نصف الوايت:
    const policy = options?.water?.halfPolicy || "multiplier";
    if (policy === "linear") {
      return Math.ceil((currentSize.pricePerTanker || 0) * 0.5);
    }
    if (policy === "multiplier") {
      return Math.ceil((currentSize.pricePerTanker || 0) * 0.6);
    }
    // fixed → لا نعرض رقم (حتى لا نضلل)؛ نرجّع 0 لنعرض "—"
    return 0;
  }, [currentSize, half, options?.water?.halfPolicy]);

  const itemsTotal = useMemo(() => {
    if (!currentSize) return 0;
    // نصف: سعر وحدة واحدة فقط
    if (half) return displayUnitPrice || 0;
    // كامل: عدد × سعر الوحدة
    return (displayUnitPrice || 0) * qty;
  }, [currentSize, displayUnitPrice, half, qty]);

  const canSubmit =
    !profileLoading &&
    !loading &&
    !!selectedAddressId &&
    !!options?.water &&
    !!currentSize &&
    (!half ? qty >= 1 : true) &&
    !submitting &&
    isLoggedIn; // ✅ لازم تسجيل دخول

  const handleSubmit = async () => {
    if (!canSubmit || !currentSize) {
      if (!requireAuth()) return; // ✅ أظهر البانر لو ضيف
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = {
        kind: "water",
        city: selectedAddress?.city,
        variant: currentSize.key,
        quantity: half ? 0.5 : qty,
        paymentMethod: pm,
        addressId: selectedAddressId!,
        notes: notes?.trim()
          ? [{ body: notes.trim(), visibility: "public" }]
          : [],
        ...(scheduledMode === "later" && scheduledFor?.trim()
          ? { scheduledFor: new Date(scheduledFor).toISOString() }
          : {}),
      };
      const { data } = await axiosInstance.post("/utility/order", payload);
      Alert.alert("تم", "تم إنشاء طلب وايت الماء بنجاح.");
      try {
        navigation.navigate("OrderDetailsScreen" as any, { order: data });
      } catch {
        navigation.navigate("MyOrders" as any);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "تعذّر إنشاء الطلب.";
      Alert.alert("خطأ", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>طلب وايت الماء</Text>

        {/* العنوان */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>العنوان</Text>
          {profileLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : addresses.length === 0 ? (
            <Text style={styles.muted}>لا توجد عناوين محفوظة.</Text>
          ) : (
            <>
              <Text style={styles.addrLine}>
                {selectedAddress?.label} — {selectedAddress?.city}
              </Text>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => {
                  if (!requireAuth()) return; // ✅ بانر للضيف
                  setAddrModal(true);
                }}
              >
                <Icon name="location-on" size={18} color={COLORS.primary} />
                <Text style={styles.linkBtnText}>تغيير العنوان</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* الخيارات */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الحجم</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : !options?.water ? (
            <Text style={styles.muted}>الخدمة غير مفعّلة في هذه المدينة.</Text>
          ) : (
            <>
              <View style={styles.rowWrap}>
                {options.water.sizes.map((s) => (
                  <Chip
                    key={s.key}
                    active={size === s.key}
                    onPress={() => setSize(s.key)}
                    label={`${
                      s.key === "small"
                        ? "صغير"
                        : s.key === "medium"
                        ? "وسط"
                        : "كبير"
                    } • ${s.capacityLiters}L`}
                    icon={
                      <IonIcon
                        name="water"
                        size={16}
                        color={size === s.key ? "#fff" : COLORS.primary}
                      />
                    }
                  />
                ))}
              </View>

              {options.water.allowHalf && (
                <>
                  <View style={styles.hr} />
                  <Text style={styles.subTitle}>النصف</Text>
                  <View style={styles.rowWrap}>
                    <Radio
                      checked={!half}
                      label="وايت كامل"
                      onPress={() => setHalf(false)}
                    />
                    <Radio
                      checked={half}
                      label="نصف وايت"
                      onPress={() => setHalf(true)}
                    />
                  </View>
                </>
              )}

              {!half && (
                <>
                  <View style={styles.hr} />
                  <Text style={styles.subTitle}>العدد</Text>
                  <Stepper value={qty} setValue={setQty} min={1} />
                </>
              )}

              <View style={styles.hr} />
              <Text style={styles.rowText}>
                سعر الوحدة التقريبي:{" "}
                <Text style={styles.bold}>
                  {/* لو fixed نعرض "—" */}
                  {displayUnitPrice
                    ? displayUnitPrice.toLocaleString()
                    : "—"}{" "}
                  ر.ي
                </Text>
              </Text>
              <Text style={styles.rowText}>
                إجمالي السلع:{" "}
                <Text style={styles.bold}>
                  {itemsTotal.toLocaleString()} ر.ي
                </Text>
              </Text>
              <Text style={styles.smallNote}>
                * التسعير النهائي ورسوم التوصيل تحدد بعد الإنشاء.
              </Text>
            </>
          )}
        </View>

        {/* الدفع */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>طريقة الدفع</Text>
          <View style={styles.rowWrap}>
            <Radio
              checked={pm === "cash"}
              label="كاش"
              onPress={() => setPM("cash")}
            />
            <Radio
              checked={pm === "wallet"}
              label="محفظة"
              onPress={() => {
                if (!requireAuth()) return;
                setPM("wallet");
              }}
            />
            <Radio
              checked={pm === "mixed"}
              label="مختلط"
              onPress={() => setPM("mixed")}
            />
          </View>
        </View>

        {/* الوقت */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الوقت</Text>
          <View style={styles.rowWrap}>
            <Radio
              checked={scheduledMode === "now"}
              label="الآن"
              onPress={() => setScheduledMode("now")}
            />
            <Radio
              checked={scheduledMode === "later"}
              label="جدولة لاحقًا"
              onPress={() => setScheduledMode("later")}
            />
          </View>
          {scheduledMode === "later" && (
            <TextInput
              placeholder="YYYY-MM-DD HH:mm"
              style={styles.input}
              value={scheduledFor}
              onChangeText={setScheduledFor}
            />
          )}
        </View>

        {/* ملاحظات */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ملاحظات</Text>
          <TextInput
            placeholder="مثال: الرجاء الاتصال قبل الوصول…"
            style={[styles.input, { height: 90 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!canSubmit || submitting) && styles.btnDisabled,
          ]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>تأكيد الطلب</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal العناوين */}
      <Modal visible={addrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addrModal}>
            <Text style={styles.modalTitle}>اختر العنوان</Text>
            <ScrollView style={{ maxHeight: 300, width: "100%" }}>
              {addresses.map((a) => (
                <TouchableOpacity
                  key={a._id}
                  style={[
                    styles.addrItem,
                    selectedAddressId === a._id && styles.addrItemActive,
                  ]}
                  onPress={() => setSelectedAddressId(a._id)}
                >
                  <Icon
                    name="place"
                    size={18}
                    color={
                      selectedAddressId === a._id ? "#fff" : COLORS.primary
                    }
                  />
                  <Text
                    style={[
                      styles.addrText,
                      selectedAddressId === a._id && { color: "#fff" },
                    ]}
                  >
                    {a.label} — {a.city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ height: 8 }} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setAddrModal(false)}
            >
              <Text style={styles.closeBtnText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UtilityWaterScreen;

// —————————————————— styles ——————————————————
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 14, paddingBottom: 40 },
  title: {
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    fontSize: 18,
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTitle: {
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    fontSize: 15,
    marginBottom: 8,
  },
  rowText: {
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 4,
  },
  bold: { fontFamily: "Cairo-Bold", color: COLORS.blue },
  subTitle: {
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    fontSize: 13,
    marginBottom: 6,
  },
  smallNote: {
    fontFamily: "Cairo-Regular",
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },
  hr: { height: 1, backgroundColor: "#f1f1f1", marginVertical: 10 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontFamily: "Cairo-Bold", color: COLORS.blue, fontSize: 12 },
  chipTextActive: { color: "#fff" },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginVertical: 4,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  radioOuterChecked: { borderColor: COLORS.primary },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  radioLabel: { fontFamily: "Cairo-Regular", fontSize: 13, color: COLORS.text },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },

  input: {
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: "#fff",
  },

  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7f5",
  },
  stepBtnDisabled: { opacity: 0.5 },
  stepValue: {
    minWidth: 30,
    textAlign: "center",
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  submitText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 15 },
  btnDisabled: { opacity: 0.6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  addrModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 10,
  },
  addrItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  addrItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addrText: { fontFamily: "Cairo-Bold", color: COLORS.text },
  closeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  closeBtnText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 14 },
  addrLine: { fontFamily: "Cairo-Bold", color: COLORS.blue },

  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  linkBtnText: {
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    fontSize: 13,
  },
  muted: { fontFamily: "Cairo-Regular", color: "#999", fontSize: 13 },
});
