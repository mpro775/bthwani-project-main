import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { Es3afniItem, URGENCY_LABELS } from "@/types/types";
import { getEs3afniDetails, deleteEs3afni } from "@/api/es3afniApi";
import { createEs3afniConversation } from "@/api/es3afniChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "Es3afniDetails">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Es3afniDetails"
>;

const Es3afniDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<Es3afniItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getEs3afniDetails(itemId);
      setItem(itemData);
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل طلب التبرع:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل البيانات");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return COLORS.gray;
      case "pending":
        return COLORS.orangeDark;
      case "confirmed":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.danger;
      case "expired":
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة";
      case "pending":
        return "في الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      case "expired":
        return "منتهي";
      default:
        return status;
    }
  };

  const getExpiresInText = (expiresAt?: string | Date) => {
    if (!expiresAt) return null;
    try {
      const end = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      const now = new Date();
      if (end <= now) return "منتهي الصلاحية";
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) return `ينتهي بعد ${Math.floor(hours / 24)} يوم`;
      if (hours > 0) return `ينتهي بعد ${hours} ساعة`;
      return `ينتهي بعد ${mins} دقيقة`;
    } catch {
      return null;
    }
  };

  const handleICanDonate = async () => {
    if (!item || !user?.uid) return;
    setStartingChat(true);
    try {
      const conv = await createEs3afniConversation(item._id);
      navigation.navigate("Es3afniChat", { conversationId: conv._id });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "فشل في فتح المحادثة";
      Alert.alert("تنبيه", Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setStartingChat(false);
    }
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "غير محدد";
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return typeof dateInput === "string"
        ? dateInput
        : dateInput.toISOString();
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate("Es3afniEdit", { itemId: item._id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            if (!item) return;

            setDeleting(true);
            try {
              await deleteEs3afni(item._id);
              Alert.alert("نجح", "تم حذف طلب التبرع بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف طلب التبرع:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف طلب التبرع");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!item) return;

    try {
      const message = `طلب تبرع بالدم: ${item.title}\n\n${
        item.description || ""
      }\n\nفصيلة الدم: ${item.bloodType || "غير محدد"}\n${
        item.location ? `الموقع: ${item.location.address}\n` : ""
      }${
        item.metadata?.unitsNeeded
          ? `الوحدات المطلوبة: ${item.metadata.unitsNeeded}\n`
          : ""
      }${
        item.metadata?.contact ? `التواصل: ${item.metadata.contact}\n` : ""
      }\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${formatDate(
        item.createdAt
      )}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  /**
   * توحيد رقم الهاتف: دعم +967، 967، 7XXXXXXXX (يمني)
   */
  const normalizePhoneNumber = (phone: string): string | null => {
    if (!phone || typeof phone !== "string") return null;
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 8) return null;
    if (/^967\d{8,}$/.test(digits)) return `+${digits}`;
    if (/^7\d{8}$/.test(digits)) return `+967${digits}`;
    if (/^0\d{8,}$/.test(digits)) return `+967${digits.slice(1)}`;
    if (digits.length >= 9) return `+${digits}`;
    return null;
  };

  const handleCall = () => {
    const raw = item?.metadata?.contact;
    if (!raw) return;

    const normalized = normalizePhoneNumber(raw);
    if (!normalized) return;

    const url = `tel:${normalized}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("خطأ", "لا يمكن إجراء المكالمة من هذا الجهاز");
        }
      })
      .catch((err) => console.error("خطأ في فتح تطبيق الهاتف:", err));
  };

  const handleLocation = () => {
    if (!item?.location) return;

    const { lat, lng } = item.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("خطأ", "لا يمكن فتح خرائط جوجل");
        }
      })
      .catch((err) => console.error("خطأ في فتح الخرائط:", err));
  };

  // دعم ownerId كنص أو كائن (population أو تنسيق MongoDB)
  const ownerIdStr =
    item && item.ownerId != null
      ? typeof item.ownerId === "string"
        ? item.ownerId
        : typeof item.ownerId === "object" && item.ownerId !== null
        ? "_id" in item.ownerId
          ? String((item.ownerId as { _id: string })._id)
          : "$oid" in item.ownerId
          ? String((item.ownerId as { $oid: string }).$oid)
          : String(item.ownerId)
        : String(item.ownerId)
      : "";
  const isOwner = Boolean(user?.uid && ownerIdStr && user.uid === ownerIdStr);

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
        <Text style={styles.errorText}>لم يتم العثور على طلب التبرع</Text>
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
        <Text style={styles.headerTitle}>تفاصيل طلب التبرع</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          {isOwner && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Ionicons name="pencil" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.danger}
                  />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Info */}
          <View style={styles.infoHeader}>
            <View style={styles.bloodTypeContainer}>
              <Ionicons
                name="water"
                size={24}
                color={getStatusColor(item.bloodType ? "confirmed" : "pending")}
              />
              <Text style={styles.bloodTypeText}>
                {item.bloodType || "غير محدد"}
              </Text>
            </View>
            <View style={styles.headerBadges}>
              {item.urgency && (
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: COLORS.orangeDark },
                  ]}
                >
                  <Text style={styles.urgencyText}>
                    {URGENCY_LABELS[
                      item.urgency as keyof typeof URGENCY_LABELS
                    ] || item.urgency}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
          {item.status === "pending" && getExpiresInText(item.expiresAt) && (
            <View style={styles.expiresRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color={COLORS.orangeDark}
              />
              <Text style={styles.expiresText}>
                {getExpiresInText(item.expiresAt)}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Blood Type */}
          {item.bloodType && (
            <View style={styles.bloodTypeSection}>
              <Text style={styles.sectionTitle}>فصيلة الدم المطلوبة</Text>
              <View style={styles.bloodTypeDisplay}>
                <Ionicons name="water" size={20} color={COLORS.danger} />
                <Text style={styles.bloodTypeValue}>{item.bloodType}</Text>
                {["O-", "AB-", "B-"].includes(item.bloodType) && (
                  <Text style={styles.criticalBadge}>نادرة</Text>
                )}
              </View>
            </View>
          )}

          {/* Location */}
          {item.location && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>الموقع</Text>
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={handleLocation}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.locationText}>{item.location.address}</Text>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Metadata */}
          {(item.metadata &&
            (item.metadata.unitsNeeded || item.metadata.contact)) ||
          item.urgency ||
          item.metadata?.urgency ? (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>بيانات إضافية</Text>
              {item.metadata?.unitsNeeded && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="flask-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>الوحدات المطلوبة:</Text>
                  <Text style={styles.metadataValue}>
                    {item.metadata.unitsNeeded} وحدة
                  </Text>
                </View>
              )}
              {item.metadata?.contact && (
                <TouchableOpacity
                  style={styles.metadataItem}
                  onPress={handleCall}
                >
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.metadataLabel}>رقم التواصل:</Text>
                  <Text
                    style={[styles.metadataValue, { color: COLORS.primary }]}
                  >
                    {item.metadata.contact}
                  </Text>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
              {(item.urgency || item.metadata?.urgency) && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={COLORS.danger}
                  />
                  <Text style={styles.metadataLabel}>درجة الاستعجال:</Text>
                  <Text
                    style={[styles.metadataValue, { color: COLORS.danger }]}
                  >
                    {item.urgency
                      ? URGENCY_LABELS[
                          item.urgency as keyof typeof URGENCY_LABELS
                        ] || item.urgency
                      : item.metadata?.urgency}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Dates */}
          <View style={styles.datesSection}>
            <Text style={styles.sectionTitle}>تواريخ مهمة</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>تاريخ الإنشاء:</Text>
              <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>{formatDate(item.updatedAt)}</Text>
            </View>
          </View>

          {/* زر أستطيع التبرع (لغير المالك عندما الطلب نشط) */}
          {!isOwner &&
            user?.uid &&
            (item.status === "pending" || item.status === "confirmed") && (
              <View style={styles.donateSection}>
                <TouchableOpacity
                  style={[
                    styles.donateButton,
                    startingChat && styles.donateButtonDisabled,
                  ]}
                  onPress={handleICanDonate}
                  disabled={startingChat}
                >
                  {startingChat ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="heart" size={22} color={COLORS.white} />
                      <Text style={styles.donateButtonText}>
                        أستطيع التبرع - فتح محادثة
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

          {/* أزرار المالك: تعديل وحذف */}
          {isOwner && (
            <View style={styles.ownerActionsSection}>
              <Text style={styles.sectionTitle}>إدارة طلبك</Text>
              <View style={styles.ownerActionsRow}>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={handleEdit}
                >
                  <Ionicons name="pencil" size={20} color={COLORS.white} />
                  <Text style={styles.editActionButtonText}>
                    تعديل البيانات
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteActionButton}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.white}
                      />
                      <Text style={styles.deleteActionButtonText}>
                        حذف الطلب
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.danger,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightRed,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bloodTypeText: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.danger,
    marginLeft: 8,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  expiresRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  expiresText: {
    fontSize: 15,
    fontFamily: "Cairo-Regular",
    color: COLORS.orangeDark,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  bloodTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 12,
  },
  bloodTypeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  bloodTypeValue: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1,
  },
  criticalBadge: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.white,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBlue,
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    fontFamily: "Cairo-Medium",
    color: COLORS.primary,
  },
  datesSection: {
    marginBottom: 24,
  },
  dateItem: {
    flexDirection: "row",
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    width: 100,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    flex: 1,
  },
  ownerActionsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  ownerActionsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  editActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 6,
  },
  editActionButtonText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.white,
  },
  deleteActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 6,
  },
  deleteActionButtonText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.white,
  },
  donateSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  donateButtonDisabled: {
    opacity: 0.7,
  },
  donateButtonText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default Es3afniDetailsScreen;
