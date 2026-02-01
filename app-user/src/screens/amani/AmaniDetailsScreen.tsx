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
import { AmaniItem } from "@/types/types";
import { getAmaniDetails, deleteAmani } from "@/api/amaniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { useAmaniSocket } from "@/hooks/useAmaniSocket";

type RouteProps = RouteProp<RootStackParamList, "AmaniDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AmaniDetails">;

const AmaniDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<AmaniItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // WebSocket connection for real-time updates
  const { connected: socketConnected } = useAmaniSocket(item?._id, {
    onStatusUpdate: (data) => {
      if (data.amaniId === item?._id) {
        loadItem(); // Reload to get updated status
      }
    },
    onDriverAssigned: (data) => {
      if (data.amaniId === item?._id) {
        loadItem(); // Reload to get driver info
      }
    },
    onLocationUpdate: (data) => {
      if (data.amaniId === item?._id) {
        setDriverLocation(data.location);
      }
    },
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getAmaniDetails(itemId);
      setItem(itemData);
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل طلب النقل:", error);
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
      case 'in_progress': return COLORS.info;
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
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate('AmaniEdit', { itemId: item._id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف طلب النقل؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            if (!item) return;

            setDeleting(true);
            try {
              await deleteAmani(item._id);
              Alert.alert("نجح", "تم حذف طلب النقل بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف طلب النقل:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف طلب النقل");
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
      const originText = item.origin ? item.origin.address : 'غير محدد';
      const destinationText = item.destination ? item.destination.address : 'غير محدد';
      const passengersText = item.metadata?.passengers ? `${item.metadata.passengers} أشخاص` : '';
      const luggageText = item.metadata?.luggage ? 'مع أمتعة' : '';

      const message = `طلب نقل نسائي: ${item.title}\n\n${item.description || ''}\n\nمن: ${originText}\nإلى: ${destinationText}\n${passengersText} ${luggageText}\n\nتاريخ النشر: ${new Date(item.createdAt).toLocaleDateString('ar-SA')}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  const isOwner = user && item && item.ownerId === user.uid;

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
        <Text style={styles.errorText}>لم يتم العثور على طلب النقل</Text>
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
        <Text style={styles.headerTitle}>تفاصيل طلب النقل</Text>
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
            <View style={styles.carIcon}>
              <Ionicons name="car" size={24} color={COLORS.primary} />
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

          {/* Route Information */}
          {(item.origin || item.destination) && (
            <View style={styles.routeSection}>
              <Text style={styles.sectionTitle}>مسار الرحلة</Text>

              {item.origin && (
                <View style={styles.locationItem}>
                  <View style={[styles.locationIcon, { backgroundColor: COLORS.primary }]}>
                    <Ionicons name="location" size={16} color={COLORS.white} />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationLabel}>من</Text>
                    <Text style={styles.locationAddress}>{item.origin.address}</Text>
                  </View>
                </View>
              )}

              <View style={styles.routeArrow}>
                <Ionicons name="arrow-down" size={20} color={COLORS.primary} />
              </View>

              {item.destination && (
                <View style={styles.locationItem}>
                  <View style={[styles.locationIcon, { backgroundColor: COLORS.success }]}>
                    <Ionicons name="navigate" size={16} color={COLORS.white} />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationLabel}>إلى</Text>
                    <Text style={styles.locationAddress}>{item.destination.address}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Metadata */}
          {item.metadata && (item.metadata.passengers || item.metadata.luggage || item.metadata.specialRequests) && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>بيانات إضافية</Text>

              {item.metadata.passengers && (
                <View style={styles.metadataItem}>
                  <Ionicons name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.metadataText}>{item.metadata.passengers} أشخاص</Text>
                </View>
              )}

              {item.metadata.luggage && (
                <View style={styles.metadataItem}>
                  <Ionicons name="bag" size={16} color={COLORS.primary} />
                  <Text style={styles.metadataText}>يوجد أمتعة</Text>
                </View>
              )}

              {item.metadata.specialRequests && (
                <View style={styles.metadataItem}>
                  <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.metadataText}>{item.metadata.specialRequests}</Text>
                </View>
              )}
            </View>
          )}

          {/* Driver Information */}
          {item.driver && (
            <View style={styles.driverSection}>
              <Text style={styles.sectionTitle}>معلومات السائق</Text>
              <View style={styles.driverCard}>
                <View style={styles.driverInfo}>
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>
                      {typeof item.driver === 'object' && item.driver.fullName
                        ? item.driver.fullName
                        : 'سائق معين'}
                    </Text>
                    {typeof item.driver === 'object' && item.driver.phone && (
                      <TouchableOpacity
                        onPress={() => {
                          Linking.openURL(`tel:${item.driver.phone}`);
                        }}
                        style={styles.phoneButton}
                      >
                        <Ionicons name="call" size={16} color={COLORS.primary} />
                        <Text style={styles.phoneText}>{item.driver.phone}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {item.assignedAt && (
                  <Text style={styles.assignedDate}>
                    تم التعيين: {new Date(item.assignedAt).toLocaleDateString('ar-SA')}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Real-time Location Tracking */}
          {item.status === 'in_progress' && (driverLocation || item.driverLocation) && (
            <View style={styles.trackingSection}>
              <Text style={styles.sectionTitle}>تتبع الموقع المباشر</Text>
              <View style={styles.trackingCard}>
                <Ionicons name="location" size={20} color={COLORS.success} />
                <Text style={styles.trackingText}>
                  السائق في الطريق - الموقع محدث
                </Text>
                {socketConnected && (
                  <View style={styles.socketIndicator}>
                    <View style={styles.socketDot} />
                    <Text style={styles.socketText}>مباشر</Text>
                  </View>
                )}
              </View>
              {/* TODO: Add map component here to show driver location */}
            </View>
          )}

          {/* Status History */}
          {item.statusHistory && item.statusHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>سجل الحالات</Text>
              {item.statusHistory.map((history, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>
                      {getStatusText(history.status)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(history.timestamp).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {history.note && (
                      <Text style={styles.historyNote}>{history.note}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Dates */}
          <View style={styles.datesSection}>
            <Text style={styles.sectionTitle}>تواريخ مهمة</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>تاريخ النشر:</Text>
              <Text style={styles.dateValue}>
                {new Date(item.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            {item.assignedAt && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>تاريخ التعيين:</Text>
                <Text style={styles.dateValue}>
                  {new Date(item.assignedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
            {item.pickedUpAt && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>تاريخ الاستلام:</Text>
                <Text style={styles.dateValue}>
                  {new Date(item.pickedUpAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
            {item.completedAt && (
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>تاريخ الإكمال:</Text>
                <Text style={styles.dateValue}>
                  {new Date(item.completedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>
                {new Date(item.updatedAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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
    fontFamily: 'Cairo-Regular',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    fontFamily: 'Cairo-Regular',
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
    fontFamily: 'Cairo-SemiBold',
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
  carIcon: {
    backgroundColor: COLORS.lightBlue,
    padding: 12,
    borderRadius: 12,
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
    fontFamily: 'Cairo-SemiBold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
    fontFamily: 'Cairo-Bold',
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Cairo-Regular',
  },
  routeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: 'Cairo-SemiBold',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
    fontFamily: 'Cairo-SemiBold',
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
    fontFamily: 'Cairo-Regular',
  },
  routeArrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Cairo-Regular',
  },
  datesSection: {
    marginBottom: 24,
  },
  dateItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 100,
    fontFamily: 'Cairo-SemiBold',
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
    fontFamily: 'Cairo-Regular',
  },
  driverSection: {
    marginBottom: 24,
  },
  driverCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: 'Cairo-SemiBold',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
    fontFamily: 'Cairo-Regular',
  },
  assignedDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    fontFamily: 'Cairo-Regular',
  },
  trackingSection: {
    marginBottom: 24,
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 8,
    padding: 12,
  },
  trackingText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Cairo-Regular',
  },
  socketIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  socketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  socketText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: 12,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: 'Cairo-SemiBold',
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
    fontFamily: 'Cairo-Regular',
  },
  historyNote: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    fontFamily: 'Cairo-Regular',
  },
});

export default AmaniDetailsScreen;
