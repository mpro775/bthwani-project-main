import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  getErrandDetails,
  updateErrandStatus,
  ErrandOrder,
  ERRAND_STATUS_LABELS,
  ERRAND_STATUS_COLORS,
  getNextAction,
} from "../api/akhdimni";

const ErrandDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { errandId } = route.params as { errandId: string };

  const [errand, setErrand] = useState<ErrandOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getErrandDetails(errandId);
      setErrand(data);
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل في جلب التفاصيل");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [errandId]);

  const handleUpdateStatus = async (newStatus: string, note?: string) => {
    if (!errand) return;

    Alert.alert(
      "تأكيد",
      `هل أنت متأكد من ${ERRAND_STATUS_LABELS[newStatus]}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              setUpdating(true);
              await updateErrandStatus(errand._id, { status: newStatus, note });
              Alert.alert("نجاح", "تم تحديث الحالة بنجاح");
              fetchDetails();
            } catch (error: any) {
              Alert.alert(
                "خطأ",
                error?.response?.data?.message || "فشل في تحديث الحالة"
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("خطأ", "لا يمكن فتح الخرائط")
    );
  };

  const callPhone = (phone?: string) => {
    if (!phone) {
      Alert.alert("تنبيه", "لا يوجد رقم هاتف");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  if (!errand) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>المهمة غير موجودة</Text>
      </View>
    );
  }

  const statusColor = ERRAND_STATUS_COLORS[errand.status] || "#6c757d";
  const statusLabel = ERRAND_STATUS_LABELS[errand.status] || errand.status;
  const nextAction = getNextAction(errand.status);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.card}>
          <Text style={styles.orderNumber}>#{errand.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Location Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>تفاصيل المهمة</Text>

          {/* Pickup */}
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <View
                style={[styles.locationDot, { backgroundColor: "#0d6efd" }]}
              />
              <Text style={styles.locationTitle}>الاستلام</Text>
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationAddress}>
                {errand.errand.pickup.label || "—"}
              </Text>
              {errand.errand.pickup.city && (
                <Text style={styles.locationSubtext}>
                  {errand.errand.pickup.city}
                  {errand.errand.pickup.street
                    ? ` • ${errand.errand.pickup.street}`
                    : ""}
                </Text>
              )}
              {errand.errand.pickup.contactName && (
                <Text style={styles.contactInfo}>
                  📞 {errand.errand.pickup.contactName}
                  {errand.errand.pickup.phone
                    ? ` - ${errand.errand.pickup.phone}`
                    : ""}
                </Text>
              )}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    openMaps(
                      errand.errand.pickup.location.lat,
                      errand.errand.pickup.location.lng,
                      "الاستلام"
                    )
                  }
                >
                  <Text style={styles.actionButtonText}>📍 الموقع</Text>
                </TouchableOpacity>
                {errand.errand.pickup.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => callPhone(errand.errand.pickup.phone)}
                  >
                    <Text style={styles.actionButtonText}>📞 اتصال</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.routeLine} />

          {/* Dropoff */}
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <View
                style={[styles.locationDot, { backgroundColor: "#198754" }]}
              />
              <Text style={styles.locationTitle}>التسليم</Text>
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationAddress}>
                {errand.errand.dropoff.label || "—"}
              </Text>
              {errand.errand.dropoff.city && (
                <Text style={styles.locationSubtext}>
                  {errand.errand.dropoff.city}
                  {errand.errand.dropoff.street
                    ? ` • ${errand.errand.dropoff.street}`
                    : ""}
                </Text>
              )}
              {errand.errand.dropoff.contactName && (
                <Text style={styles.contactInfo}>
                  📞 {errand.errand.dropoff.contactName}
                  {errand.errand.dropoff.phone
                    ? ` - ${errand.errand.dropoff.phone}`
                    : ""}
                </Text>
              )}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    openMaps(
                      errand.errand.dropoff.location.lat,
                      errand.errand.dropoff.location.lng,
                      "التسليم"
                    )
                  }
                >
                  <Text style={styles.actionButtonText}>📍 الموقع</Text>
                </TouchableOpacity>
                {errand.errand.dropoff.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => callPhone(errand.errand.dropoff.phone)}
                  >
                    <Text style={styles.actionButtonText}>📞 اتصال</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>معلومات الطلب</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>النوع:</Text>
            <Text style={styles.infoValue}>{errand.errand.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الحجم:</Text>
            <Text style={styles.infoValue}>{errand.errand.size}</Text>
          </View>
          {errand.errand.weightKg && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الوزن:</Text>
              <Text style={styles.infoValue}>
                {errand.errand.weightKg} كجم
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>المسافة:</Text>
            <Text style={styles.infoValue}>
              {errand.errand.distanceKm.toFixed(1)} كم
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الرسوم:</Text>
            <Text style={styles.infoValue}>{errand.deliveryFee} ريال</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الدفع:</Text>
            <Text style={styles.infoValue}>{errand.paymentMethod}</Text>
          </View>
          {errand.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.infoLabel}>ملاحظات:</Text>
              <Text style={styles.notesText}>{errand.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      {nextAction && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              updating && styles.actionBtnDisabled,
            ]}
            onPress={() => handleUpdateStatus(nextAction.status)}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>{nextAction.label}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: "#dc3545",
  },
  content: {
    padding: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNumber: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: "#212529",
    marginBottom: 8,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#212529",
    marginBottom: 12,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: "#495057",
  },
  locationDetails: {
    marginLeft: 24,
  },
  locationAddress: {
    fontSize: 15,
    fontFamily: "Cairo-Bold",
    color: "#212529",
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#6c757d",
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#495057",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: "#495057",
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#dee2e6",
    marginLeft: 7,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: "#6c757d",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: "#212529",
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  notesText: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#495057",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  actionBtn: {
    backgroundColor: "#0d6efd",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
});

export default ErrandDetailsScreen;

