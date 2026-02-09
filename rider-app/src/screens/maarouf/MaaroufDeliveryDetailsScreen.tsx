import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import {
  MaaroufDeliveryItem,
  RewardHold,
  getMaaroufDetails,
  getMaaroufRewardHolds,
  verifyMaaroufRewardCode,
} from "../../src/api/maarouf";

const MaaroufDeliveryDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<MaaroufDeliveryItem | null>(null);
  const [holds, setHolds] = useState<RewardHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [details, rewardHolds] = await Promise.all([
        getMaaroufDetails(id),
        getMaaroufRewardHolds(id),
      ]);
      setItem(details);
      setHolds(Array.isArray(rewardHolds) ? rewardHolds : []);
    } catch (error: any) {
      console.error("Error loading Maarouf delivery:", error);
      const msg =
        error?.response?.data?.userMessage ??
        error?.response?.data?.message ??
        "فشل في تحميل تفاصيل التوصيل";
      Alert.alert("خطأ", msg, [{ text: "رجوع", onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingHold = holds.find((h) => h.status === "pending");

  const handleVerifyCode = async () => {
    if (!id || !pendingHold) return;
    if (!code || code.length < 3) {
      Alert.alert("تنبيه", "يرجى إدخال رمز الاستلام الصحيح");
      return;
    }

    try {
      setSubmitting(true);
      await verifyMaaroufRewardCode(id, pendingHold._id, code.trim());
      Alert.alert("تم", "تم تأكيد التسليم وإطلاق المكافأة بنجاح");
      setCode("");
      loadData();
    } catch (error: any) {
      const msg =
        error?.response?.data?.userMessage ??
        error?.response?.data?.message ??
        "فشل في التحقق من الرمز";
      Alert.alert("خطأ", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل التفاصيل...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>لم يتم العثور على الإعلان</Text>
      </View>
    );
  }

  const pickup =
    (item.metadata as any)?.pickupAddress ||
    (item.metadata as any)?.pickup ||
    "—";
  const dropoff =
    (item.metadata as any)?.dropoffAddress ||
    (item.metadata as any)?.dropoff ||
    "—";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل توصيل معروف</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الموقع</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.locationText}>الاستلام: {pickup}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="navigate" size={18} color={COLORS.success} />
            <Text style={styles.locationText}>التسليم: {dropoff}</Text>
          </View>
        </View>

        {typeof item.reward === "number" && item.reward > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المكافأة</Text>
            <View style={styles.rewardRow}>
              <Ionicons name="gift" size={20} color={COLORS.primary} />
              <Text style={styles.rewardText}>{item.reward} ر.س</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة المكافأة</Text>
          {holds.length === 0 ? (
            <Text style={styles.helperText}>لا يوجد حجز مكافأة حتى الآن</Text>
          ) : (
            holds.map((h) => (
              <View key={h._id} style={styles.holdRow}>
                <Text style={styles.holdAmount}>{h.amount} ر.س</Text>
                <Text style={styles.holdStatus}>
                  {h.status === "pending"
                    ? "قيد الانتظار"
                    : h.status === "released"
                    ? "تم الإطلاق"
                    : "تم الاسترداد"}
                </Text>
              </View>
            ))
          )}
        </View>

        {pendingHold && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تأكيد الاستلام</Text>
            <Text style={styles.helperText}>
              اطلب من المستلم إعطاءك رمز الاستلام ثم أدخله أدناه لتأكيد التسليم
              وإطلاق المكافأة.
            </Text>
            <View style={styles.codeRow}>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="أدخل رمز الاستلام"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleVerifyCode}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>تم التسليم</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: "#111827",
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "Cairo-Regular",
  },
  title: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: "#4b5563",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#111827",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: "#374151",
    flex: 1,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  helperText: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#6b7280",
    marginBottom: 8,
  },
  holdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  holdAmount: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: "#111827",
  },
  holdStatus: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#6b7280",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    backgroundColor: "#f9fafb",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Cairo-Bold",
  },
});

export default MaaroufDeliveryDetailsScreen;
