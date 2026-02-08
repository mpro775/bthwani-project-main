import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import {
  getArabonDetails,
  getArabonSlots,
  confirmBooking,
  validateBookingCoupon,
  type ArabonItem,
  type BookingSlotItem,
} from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "ArabonBook">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ArabonBook"
>;

const ArabonBookScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [arabon, setArabon] = useState<ArabonItem | null>(null);
  const [slots, setSlots] = useState<BookingSlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotItem | null>(
    null
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!itemId) return;
    try {
      setLoading(true);
      const [arabonData, slotsRes] = await Promise.all([
        getArabonDetails(itemId),
        getArabonSlots(itemId),
      ]);
      setArabon(arabonData);
      setSlots(slotsRes.data ?? []);
      setSelectedSlot(null);
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل البيانات");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatSlotTime = (datetime: string) => {
    try {
      const d = new Date(datetime);
      return d.toLocaleDateString("ar-SA", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return datetime;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toFixed(2)} ريال`;
  };

  const handleApplyCoupon = async () => {
    if (!arabon || !couponCode.trim()) return;
    const amount = arabon.depositAmount ?? 0;
    setCouponError(null);
    setCouponDiscount(null);
    try {
      const res = await validateBookingCoupon(
        arabon._id,
        couponCode.trim(),
        amount
      );
      if (res.valid && res.discountAmount !== undefined) {
        setCouponDiscount(res.discountAmount);
      } else {
        setCouponError(res.message || "كوبون غير صالح");
      }
    } catch {
      setCouponError("حدث خطأ في التحقق من الكوبون");
    }
  };

  const finalAmount = arabon
    ? Math.max(0, (arabon.depositAmount ?? 0) - (couponDiscount ?? 0))
    : 0;

  const handleConfirmBooking = async () => {
    if (!arabon || !selectedSlot || !user) return;
    const amount = finalAmount;
    if (amount > 0) {
      Alert.alert(
        "تأكيد الحجز",
        `سيتم حجز ${formatCurrency(amount)} من محفظتك. هل تريد المتابعة؟`,
        [
          { text: "إلغاء", style: "cancel" },
          { text: "تأكيد", onPress: doConfirm },
        ]
      );
    } else {
      await doConfirm();
    }
  };

  const doConfirm = async () => {
    if (!arabon || !selectedSlot) return;
    setBooking(true);
    try {
      await confirmBooking(arabon._id, {
        slotId: selectedSlot._id,
        depositAmount: arabon.depositAmount,
        ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
      });
      Alert.alert("تم الحجز", "تم تأكيد حجزك بنجاح", [
        {
          text: "حجوزاتي",
          onPress: () => navigation.navigate("ArabonMyBookings" as never),
        },
        {
          text: "متابعة",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.userMessage ||
        e?.message ||
        "تعذر إتمام الحجز";
      Alert.alert("خطأ", msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل الأوقات المتاحة...</Text>
      </View>
    );
  }

  if (!arabon) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>لم يتم العثور على العربون</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اختر وقت الحجز</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.arabonSummary}>
          <Text style={styles.arabonTitle}>{arabon.title}</Text>
          <Text style={styles.arabonAmount}>
            العربون: {formatCurrency(arabon.depositAmount)}
          </Text>
          {couponDiscount != null && couponDiscount > 0 && (
            <Text style={styles.couponSuccess}>
              خصم: {formatCurrency(couponDiscount)} — المبلغ النهائي:{" "}
              {formatCurrency(finalAmount)}
            </Text>
          )}
        </View>

        {(arabon.depositAmount ?? 0) > 0 && (
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>كوبون خصم (اختياري)</Text>
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="أدخل كود الكوبون"
                placeholderTextColor={COLORS.gray}
                value={couponCode}
                onChangeText={(t) => {
                  setCouponCode(t);
                  setCouponError(null);
                  setCouponDiscount(null);
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.couponButton}
                onPress={handleApplyCoupon}
              >
                <Text style={styles.couponApplyText}>تطبيق</Text>
              </TouchableOpacity>
            </View>
            {couponError && (
              <Text style={styles.couponError}>{couponError}</Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>الأوقات المتاحة</Text>
        {slots.length === 0 ? (
          <View style={styles.emptySlots}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد أوقات متاحة حالياً</Text>
            <Text style={styles.emptyHint}>
              تواصل مع صاحب المنشأة لإضافة أوقات
            </Text>
          </View>
        ) : (
          <View style={styles.slotsList}>
            {slots.map((slot) => (
              <TouchableOpacity
                key={slot._id}
                style={[
                  styles.slotCard,
                  selectedSlot?._id === slot._id && styles.slotCardSelected,
                ]}
                onPress={() => setSelectedSlot(slot)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    selectedSlot?._id === slot._id
                      ? "checkmark-circle"
                      : "time-outline"
                  }
                  size={24}
                  color={
                    selectedSlot?._id === slot._id
                      ? COLORS.primary
                      : COLORS.textLight
                  }
                />
                <Text style={styles.slotTime}>
                  {formatSlotTime(slot.datetime)}
                </Text>
                {slot.durationMinutes && (
                  <Text style={styles.slotDuration}>
                    {slot.durationMinutes} دقيقة
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedSlot && slots.length > 0 && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              booking && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={22} color="#fff" />
                <Text style={styles.confirmButtonText}>تأكيد الحجز</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.textLight },
  errorText: { fontSize: 16, color: COLORS.danger },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  content: { flex: 1, padding: 16 },
  arabonSummary: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  arabonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  arabonAmount: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
  couponSuccess: {
    fontSize: 13,
    color: COLORS.success || "#22c55e",
    marginTop: 6,
  },
  couponSection: { marginBottom: 20 },
  couponRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  couponButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  couponApplyText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  couponError: {
    fontSize: 12,
    color: COLORS.danger || "#ef4444",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  emptySlots: {
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
  },
  emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: 12 },
  emptyHint: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  slotsList: { gap: 12 },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  slotCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  slotTime: { flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.text },
  slotDuration: { fontSize: 12, color: COLORS.textLight },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});

export default ArabonBookScreen;
