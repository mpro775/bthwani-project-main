// screens/Utility/UtilityGasScreen.tsx
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { getAuthBanner } from "@/guards/bannerGateway";
import { RootStackParamList } from "@/types/navigation";
import axiosInstance from "@/utils/api/axiosInstance";
import { API_URL } from "@/utils/api/config";
import { MaterialIcons as Icon } from "@expo/vector-icons";
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
  "UtilityGasScreen"
>;

type Address = {
  _id: string;
  label: string;
  street?: string;
  city: string;
  location: { lat: number; lng: number };
};

type UtilityOptionsResp = {
  city: string;
  gas: null | {
    cylinderSizeLiters: number;
    pricePerCylinder: number;
    minQty: number;
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  };
  water: any;
};

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
  max = 50,
}: {
  value: number;
  setValue: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <View style={styles.stepper}>
    <TouchableOpacity
      testID="qty-dec"
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
      testID="qty-inc"
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

const UtilityGasScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const [options, setOptions] = useState<UtilityOptionsResp | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [scheduledMode, setScheduledMode] = useState<"now" | "later">("now");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [pm, setPM] = useState<"cash" | "wallet" | "card" | "mixed">("cash");

  const [addrModal, setAddrModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isLoggedIn, authReady } = useAuth();

  const requireAuth = () => {
    if (authReady && !isLoggedIn) {
      getAuthBanner()?.show("login");
      return false;
    }
    return true;
  };

  // 1) Fetch profile (addresses)
  useEffect(() => {
    (async () => {
      try {
        setProfileLoading(true);

        // ✅ لو ضيف، لا تنادي الـ API، وأظهر بانر تسجيل
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
        Alert.alert("عنوانك", "فشل تحميل العناوين. تأكد من تسجيل الدخول.");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [authReady, isLoggedIn]);

  // 2) Fetch utility options by city
  useEffect(() => {
    (async () => {
      try {
        if (!selectedAddress?.city) return;
        setLoading(true);
        const resp = await fetch(
          `${API_URL}/utility/options?city=${encodeURIComponent(
            selectedAddress.city
          )}`
        );
        const data = (await resp.json()) as UtilityOptionsResp;
        setOptions(data);
        // اضبط الحد الأدنى للكمية
        if (data?.gas?.minQty && qty < data.gas.minQty) {
          setQty(data.gas.minQty);
        }
      } catch (e) {
        console.error(e);
        Alert.alert("التسعير", "لا توجد إعدادات تسعير لهذه المدينة.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedAddress?.city]);

  const unitPrice = options?.gas?.pricePerCylinder || 0;
  const minQty = options?.gas?.minQty || 1;
  const cylinderSize = options?.gas?.cylinderSizeLiters || 20;
  const itemsTotal = unitPrice * qty;

  const canSubmit =
    !profileLoading &&
    !loading &&
    !!selectedAddressId &&
    !!options?.gas &&
    qty >= (options?.gas?.minQty || 1) &&
    !submitting &&
    isLoggedIn; // ✅ لازم تسجيل دخول

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!requireAuth()) return; // ✅ أظهر البانر لو ضيف
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = {
        kind: "gas",
        city: selectedAddress?.city,
        variant: `${cylinderSize}L`,
        quantity: qty,
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
      Alert.alert("تم", "تم إنشاء طلب دبّة الغاز بنجاح.");
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
        <Text style={styles.title}>طلب دبّة الغاز</Text>

        {/* العنوان المختار */}
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

        {/* معلومات التسعير */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>التسعير</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : !options?.gas ? (
            <Text style={styles.muted}>الخدمة غير مفعّلة في هذه المدينة.</Text>
          ) : (
            <>
              <Text style={styles.rowText}>
                حجم الأسطوانة:{" "}
                <Text style={styles.bold}>{cylinderSize} لتر</Text>
              </Text>
              <Text style={styles.rowText}>
                سعر الأسطوانة:{" "}
                <Text style={styles.bold}>
                  {unitPrice.toLocaleString()} ر.ي
                </Text>
              </Text>
              <Text style={styles.rowText}>
                الحد الأدنى: <Text style={styles.bold}>{minQty}</Text>
              </Text>

              <View style={styles.hr} />

              <Text style={styles.subTitle}>الكمية</Text>
              <Stepper
                value={qty}
                setValue={(v) => setQty(Math.max(minQty, v))}
                min={minQty}
              />

              <View style={styles.hr} />
              <Text style={styles.rowText}>
                إجمالي السلع:{" "}
                <Text style={styles.bold}>
                  {itemsTotal.toLocaleString()} ر.ي
                </Text>
              </Text>
              <Text style={styles.smallNote}>
                * رسوم التوصيل تُحسب حسب السياسة (ثابت/مسافة) وتظهر بعد إنشاء
                الطلب.
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
                if (!requireAuth()) return; // محفظة تحتاج حساب
                setPM("wallet");
              }}
            />

            <Radio
              checked={pm === "mixed"}
              label="مختلط"
              onPress={() => setPM("mixed")}
            />
            <Radio
              checked={pm === "card"}
              label="بطاقة"
              onPress={() => setPM("card")}
            />
          </View>
        </View>

        {/* الجدولة */}
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
            placeholder="مثال: تواصل قبل الوصول / الموقع داخل الحوش…"
            style={[styles.input, { height: 90 }]}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity
          testID="submit-gas-order"
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

      {/* Modal اختيار العنوان */}
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

export default UtilityGasScreen;

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

  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  linkBtnText: {
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    fontSize: 13,
  },

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

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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

  muted: { fontFamily: "Cairo-Regular", color: "#999", fontSize: 13 },
  bold: { fontFamily: "Cairo-Bold" },
});
