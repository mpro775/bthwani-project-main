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
  Image,
  Dimensions,
  Linking,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { ArabonItem } from "@/types/types";
import {
  getArabonDetails,
  deleteArabon,
  updateArabonStatus,
  getArabonActivity,
  submitArabonRequest,
  getArabonRequests,
  type ArabonStatus,
  type ArabonActivityItem,
  type ArabonRequestItem,
} from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "ArabonDetails">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ArabonDetails"
>;

const ArabonDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<ArabonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activity, setActivity] = useState<ArabonActivityItem[]>([]);
  const [requests, setRequests] = useState<ArabonRequestItem[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getArabonDetails(itemId);
      setItem(itemData);
      try {
        const activityRes = await getArabonActivity(itemId);
        setActivity(activityRes.data ?? []);
      } catch {
        setActivity([]);
      }
      // صاحب المنشأة فقط: تحميل الطلبات المقدمة
      if (
        user &&
        (String(itemData.ownerId) === user.uid || itemData.ownerId === user.uid)
      ) {
        try {
          const reqList = await getArabonRequests(itemId);
          setRequests(reqList ?? []);
        } catch {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل العربون:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل البيانات");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation, user?.uid]);

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
      default:
        return status;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate("ArabonEdit", { itemId: item._id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا العربون؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            if (!item) return;

            setDeleting(true);
            try {
              await deleteArabon(item._id);
              Alert.alert("نجح", "تم حذف العربون بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف العربون:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف العربون");
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
      const priceInfo = item.pricePerPeriod
        ? `${formatCurrency(item.pricePerPeriod)}/${
            item.bookingPeriod === "hour"
              ? "ساعة"
              : item.bookingPeriod === "day"
              ? "يوم"
              : "أسبوع"
          }`
        : formatCurrency(item.bookingPrice || item.depositAmount);
      const message = `عربون: ${item.title}\n\n${item.description || ""}\n\n${
        item.category ? `النوع: ${item.category}\n` : ""
      }السعر: ${priceInfo}\nعربون: ${formatCurrency(item.depositAmount)}\n${
        item.contactPhone ? `للحجز: ${item.contactPhone}\n` : ""
      }${
        item.scheduleAt
          ? `الموعد: ${formatDate(
              item.scheduleAt != null ? String(item.scheduleAt) : undefined
            )}\n`
          : ""
      }${
        item.metadata?.guests ? `عدد الأشخاص: ${item.metadata.guests}\n` : ""
      }\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${formatDate(
        item.createdAt != null ? String(item.createdAt) : undefined
      )}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  const openLink = (url?: string) => {
    if (url?.trim()) Linking.openURL(url.trim());
  };

  const handleStatusChange = async (newStatus: ArabonStatus) => {
    if (!item) return;
    setStatusUpdating(true);
    try {
      await updateArabonStatus(item._id, newStatus);
      await loadItem();
      Alert.alert("نجح", "تم تحديث الحالة بنجاح");
    } catch (e) {
      console.error(e);
      Alert.alert("خطأ", "تعذر تحديث الحالة");
    } finally {
      setStatusUpdating(false);
    }
  };

  const isOwner =
    user &&
    item &&
    (String(item.ownerId) === user.uid || item.ownerId === user.uid);
  const canChangeStatus =
    isOwner &&
    item &&
    item.status !== "completed" &&
    item.status !== "cancelled";
  const isUpcoming = item?.scheduleAt
    ? new Date(item.scheduleAt) > new Date()
    : false;
  const canSubmitRequest =
    !isOwner &&
    user &&
    item &&
    item.status !== "draft" &&
    item.status !== "cancelled";

  const handleSubmitRequest = async () => {
    if (!item || !user) return;
    setSubmittingRequest(true);
    try {
      await submitArabonRequest(item._id);
      Alert.alert("تم", "تم تقديم طلبك بنجاح");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "تعذر تقديم الطلب";
      Alert.alert("خطأ", msg);
    } finally {
      setSubmittingRequest(false);
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
        <Text style={styles.headerTitle}>تفاصيل العربون</Text>
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
          {/* Images Gallery */}
          {item.images && item.images.length > 0 && (
            <View style={styles.imagesSection}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScroll}
              >
                {item.images.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.detailImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {item.images.length > 1 && (
                <Text style={styles.imageCount}>{item.images.length} صورة</Text>
              )}
            </View>
          )}

          {/* Header Info */}
          <View style={styles.infoHeader}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                {item.pricePerPeriod
                  ? `${formatCurrency(item.pricePerPeriod)}/${
                      item.bookingPeriod === "hour"
                        ? "ساعة"
                        : item.bookingPeriod === "day"
                        ? "يوم"
                        : "أسبوع"
                    }`
                  : formatCurrency(item.bookingPrice || item.depositAmount)}
              </Text>
            </View>
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

          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Contact & Social */}
          {(item.contactPhone || item.socialLinks) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>التواصل والحجز</Text>
              {item.contactPhone && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`tel:${item.contactPhone}`)}
                >
                  <Ionicons name="call" size={20} color={COLORS.primary} />
                  <Text style={styles.contactText}>{item.contactPhone}</Text>
                  <Text style={styles.contactHint}>اضغط للاتصال</Text>
                </TouchableOpacity>
              )}
              {item.socialLinks && (
                <View style={styles.socialRow}>
                  {item.socialLinks.whatsapp && (
                    <TouchableOpacity
                      style={styles.socialBtn}
                      onPress={() => openLink(item.socialLinks?.whatsapp)}
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={24}
                        color="#25D366"
                      />
                    </TouchableOpacity>
                  )}
                  {item.socialLinks.facebook && (
                    <TouchableOpacity
                      style={styles.socialBtn}
                      onPress={() => openLink(item.socialLinks?.facebook)}
                    >
                      <Ionicons
                        name="logo-facebook"
                        size={24}
                        color="#1877F2"
                      />
                    </TouchableOpacity>
                  )}
                  {item.socialLinks.instagram && (
                    <TouchableOpacity
                      style={styles.socialBtn}
                      onPress={() => openLink(item.socialLinks?.instagram)}
                    >
                      <Ionicons
                        name="logo-instagram"
                        size={24}
                        color="#E4405F"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Pricing */}
          {(item.bookingPrice || item.pricePerPeriod || item.depositAmount) && (
            <View style={styles.pricingSection}>
              <Text style={styles.sectionTitle}>التسعير</Text>
              {item.pricePerPeriod && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>السعر لكل فترة:</Text>
                  <Text style={styles.pricingValue}>
                    {formatCurrency(item.pricePerPeriod)}{" "}
                    {item.bookingPeriod === "hour"
                      ? "ريال/ساعة"
                      : item.bookingPeriod === "day"
                      ? "ريال/يوم"
                      : "ريال/أسبوع"}
                  </Text>
                </View>
              )}
              {item.bookingPrice && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>قيمة الحجز:</Text>
                  <Text style={styles.pricingValue}>
                    {formatCurrency(item.bookingPrice)}
                  </Text>
                </View>
              )}
              {item.depositAmount && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    قيمة العربون المطلوب تحويلها:
                  </Text>
                  <Text style={[styles.pricingValue, styles.depositHighlight]}>
                    {formatCurrency(item.depositAmount)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Schedule */}
          {item.scheduleAt && (
            <View style={styles.scheduleSection}>
              <Text style={styles.sectionTitle}>موعد التنفيذ</Text>
              <View style={styles.scheduleContainer}>
                <Ionicons
                  name={
                    isUpcoming ? "calendar-outline" : "checkmark-circle-outline"
                  }
                  size={20}
                  color={isUpcoming ? COLORS.primary : COLORS.success}
                />
                <Text
                  style={[
                    styles.scheduleText,
                    { color: isUpcoming ? COLORS.primary : COLORS.success },
                  ]}
                >
                  {formatDate(item.scheduleAt)}
                </Text>
                {isUpcoming && <Text style={styles.upcomingText}>قادم</Text>}
              </View>
            </View>
          )}

          {/* Metadata */}
          {item.metadata && (item.metadata.guests || item.metadata.notes) && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>بيانات إضافية</Text>
              {item.metadata.guests && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>عدد الأشخاص:</Text>
                  <Text style={styles.metadataValue}>
                    {item.metadata.guests}
                  </Text>
                </View>
              )}
              {item.metadata.notes && (
                <View style={styles.notesContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.notesTitle}>ملاحظات:</Text>
                  <Text style={styles.notesText}>{item.metadata.notes}</Text>
                </View>
              )}
            </View>
          )}

          {/* حجز مباشر أو تقديم طلب (للمستخدمين غير صاحب المنشأة) */}
          {canSubmitRequest && (
            <View style={styles.submitRequestSection}>
              <TouchableOpacity
                style={[
                  styles.submitRequestBtn,
                  submittingRequest && styles.submitRequestBtnDisabled,
                ]}
                onPress={() =>
                  navigation.navigate(
                    "ArabonBook" as never,
                    { itemId: item._id } as never
                  )
                }
              >
                <Ionicons name="calendar" size={20} color={COLORS.white} />
                <Text style={styles.submitRequestBtnText}>احجز الآن</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitRequestBtnSecondary,
                  submittingRequest && styles.submitRequestBtnDisabled,
                ]}
                onPress={handleSubmitRequest}
                disabled={submittingRequest}
              >
                {submittingRequest ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.submitRequestBtnTextSecondary}>
                      تقديم طلب
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* تغيير سريع للحالة */}
          {canChangeStatus && (
            <View style={styles.statusActionsSection}>
              <Text style={styles.sectionTitle}>تغيير الحالة</Text>
              {statusUpdating && (
                <View style={styles.statusUpdatingRow}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.statusUpdatingText}>جاري التحديث...</Text>
                </View>
              )}
              {!statusUpdating && (
                <View style={styles.statusActionsRow}>
                  {(item.status === "draft" || item.status === "pending") && (
                    <TouchableOpacity
                      style={[
                        styles.statusActionBtn,
                        styles.statusActionConfirm,
                      ]}
                      onPress={() => handleStatusChange("confirmed")}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.statusActionText}>تأكيد</Text>
                    </TouchableOpacity>
                  )}
                  {item.status !== "completed" &&
                    item.status !== "cancelled" && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.statusActionBtn,
                            styles.statusActionComplete,
                          ]}
                          onPress={() => handleStatusChange("completed")}
                        >
                          <Ionicons
                            name="checkmark-done"
                            size={18}
                            color={COLORS.white}
                          />
                          <Text style={styles.statusActionText}>مكتمل</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.statusActionBtn,
                            styles.statusActionCancel,
                          ]}
                          onPress={() => handleStatusChange("cancelled")}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={COLORS.white}
                          />
                          <Text style={styles.statusActionText}>إلغاء</Text>
                        </TouchableOpacity>
                      </>
                    )}
                </View>
              )}
            </View>
          )}

          {/* الطلبات المقدمة (لصاحب المنشأة فقط) */}
          {isOwner && requests.length > 0 && (
            <View style={styles.requestsSection}>
              <Text style={styles.sectionTitle}>الطلبات المقدمة</Text>
              {requests.map((req) => (
                <View key={req._id} style={styles.requestItem}>
                  <View style={styles.requestRow}>
                    <Text style={styles.requestStatusBadge}>
                      {req.status === "pending"
                        ? "في الانتظار"
                        : req.status === "accepted"
                        ? "مقبول"
                        : "مرفوض"}
                    </Text>
                    <Text style={styles.requestDate}>
                      {formatDate(req.createdAt)}
                    </Text>
                  </View>
                  {req.message ? (
                    <Text style={styles.requestMessage}>{req.message}</Text>
                  ) : null}
                  <Text style={styles.requestRequesterId}>
                    معرف مقدم الطلب: {req.requesterId}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* سجل تغيير الحالة */}
          {activity.length > 0 && (
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>سجل تغيير الحالة</Text>
              {activity.map((a) => (
                <View key={a._id} style={styles.activityItem}>
                  <Text style={styles.activityText}>
                    {a.oldStatus ? `${getStatusText(a.oldStatus)} → ` : ""}
                    {getStatusText(a.newStatus)}
                  </Text>
                  <Text style={styles.activityDate}>
                    {formatDate(a.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Dates */}
          <View style={styles.datesSection}>
            <Text style={styles.sectionTitle}>تواريخ مهمة</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>تاريخ الإنشاء:</Text>
              <Text style={styles.dateValue}>
                {formatDate(
                  item.createdAt != null ? String(item.createdAt) : undefined
                )}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>
                {formatDate(
                  item.updatedAt != null ? String(item.updatedAt) : undefined
                )}
              </Text>
            </View>
          </View>
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
    color: COLORS.textLight,
    fontFamily: "Cairo-Regular",
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
  imagesSection: {
    marginBottom: 16,
    marginHorizontal: -16,
  },
  imagesScroll: {
    maxHeight: 220,
  },
  detailImage: {
    width: Dimensions.get("window").width,
    height: 220,
    backgroundColor: COLORS.lightGray,
  },
  imageCount: {
    position: "absolute" as const,
    bottom: 8,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "Cairo-Regular",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginLeft: 12,
    flex: 1,
  },
  contactHint: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  socialBtn: {
    padding: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
  },
  pricingValue: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  depositHighlight: {
    color: COLORS.success,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  amountContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.white,
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
  scheduleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 12,
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    marginLeft: 8,
    flex: 1,
  },
  upcomingText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
  notesContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 4,
    marginLeft: 24,
  },
  notesText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    lineHeight: 20,
    marginLeft: 24,
  },
  submitRequestSection: {
    marginBottom: 24,
  },
  submitRequestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  submitRequestBtnDisabled: {
    opacity: 0.7,
  },
  submitRequestBtnText: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  submitRequestBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  submitRequestBtnTextSecondary: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
  requestsSection: {
    marginBottom: 24,
  },
  requestItem: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  requestStatusBadge: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
  requestDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  requestMessage: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginBottom: 4,
  },
  requestRequesterId: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  statusActionsSection: {
    marginBottom: 24,
  },
  statusUpdatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusUpdatingText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  statusActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  statusActionConfirm: {
    backgroundColor: COLORS.primary,
  },
  statusActionComplete: {
    backgroundColor: COLORS.success,
  },
  statusActionCancel: {
    backgroundColor: COLORS.danger,
  },
  statusActionText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 6,
  },
  activityText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
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
});

export default ArabonDetailsScreen;
