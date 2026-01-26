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
  type ArabonStatus,
  type ArabonActivityItem,
} from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "ArabonDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArabonDetails">;

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
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل العربون:", error);
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
      case 'draft': return COLORS.gray;
      case 'pending': return COLORS.orangeDark;
      case 'confirmed': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'غير محدد';
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate('ArabonEdit', { itemId: item._id });
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
      const message = `عربون: ${item.title}\n\n${item.description || ''}\n\nالمبلغ: ${formatCurrency(item.depositAmount)}\n${item.scheduleAt ? `الموعد: ${formatDate(item.scheduleAt.toString())}\n` : ''}${item.metadata?.guests ? `عدد الأشخاص: ${item.metadata.guests}\n` : ''}\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${formatDate(item.createdAt.toString())}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
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

  const isOwner = user && item && (String(item.ownerId) === user.uid || item.ownerId === user.uid);
  const canChangeStatus = isOwner && item && item.status !== "completed" && item.status !== "cancelled";
  const isUpcoming = item?.scheduleAt ? new Date(item.scheduleAt) > new Date() : false;

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
              <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
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
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Info */}
          <View style={styles.infoHeader}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>{formatCurrency(item.depositAmount)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Schedule */}
          {item.scheduleAt && (
            <View style={styles.scheduleSection}>
              <Text style={styles.sectionTitle}>موعد التنفيذ</Text>
              <View style={styles.scheduleContainer}>
                <Ionicons
                  name={isUpcoming ? "calendar-outline" : "checkmark-circle-outline"}
                  size={20}
                  color={isUpcoming ? COLORS.primary : COLORS.success}
                />
                <Text style={[
                  styles.scheduleText,
                  { color: isUpcoming ? COLORS.primary : COLORS.success }
                ]}>
                  {formatDate(item.scheduleAt)}
                </Text>
                {isUpcoming && (
                  <Text style={styles.upcomingText}>قادم</Text>
                )}
              </View>
            </View>
          )}

          {/* Metadata */}
          {item.metadata && (item.metadata.guests || item.metadata.notes) && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>بيانات إضافية</Text>
              {item.metadata.guests && (
                <View style={styles.metadataItem}>
                  <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.metadataLabel}>عدد الأشخاص:</Text>
                  <Text style={styles.metadataValue}>{item.metadata.guests}</Text>
                </View>
              )}
              {item.metadata.notes && (
                <View style={styles.notesContainer}>
                  <Ionicons name="document-text-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.notesTitle}>ملاحظات:</Text>
                  <Text style={styles.notesText}>{item.metadata.notes}</Text>
                </View>
              )}
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
                      style={[styles.statusActionBtn, styles.statusActionConfirm]}
                      onPress={() => handleStatusChange("confirmed")}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                      <Text style={styles.statusActionText}>تأكيد</Text>
                    </TouchableOpacity>
                  )}
                  {item.status !== "completed" && item.status !== "cancelled" && (
                    <>
                      <TouchableOpacity
                        style={[styles.statusActionBtn, styles.statusActionComplete]}
                        onPress={() => handleStatusChange("completed")}
                      >
                        <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                        <Text style={styles.statusActionText}>مكتمل</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusActionBtn, styles.statusActionCancel]}
                        onPress={() => handleStatusChange("cancelled")}
                      >
                        <Ionicons name="close-circle" size={18} color={COLORS.white} />
                        <Text style={styles.statusActionText}>إلغاء</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
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
                {formatDate(item.createdAt.toString())}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.updatedAt.toString())}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: COLORS.success,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  scheduleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  upcomingText: {
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    marginLeft: 24,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginLeft: 24,
  },
  statusActionsSection: {
    marginBottom: 24,
  },
  statusUpdatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusUpdatingText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.white,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 6,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  datesSection: {
    marginBottom: 24,
  },
  dateItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 100,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
});

export default ArabonDetailsScreen;
