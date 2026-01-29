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
import { KenzItem } from "@/types/types";
import { getKenzDetails, deleteKenz } from "@/api/kenzApi";
import { createConversation } from "@/api/kenzChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "KenzDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KenzDetails">;

const KenzDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<KenzItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getKenzDetails(itemId);
      setItem(itemData);
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل الإعلان:", error);
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
      case 'confirmed': return 'متاح';
      case 'completed': return 'مباع';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatCurrency = (price?: number) => {
    if (!price) return 'غير محدد';
    return `${price.toLocaleString('ar-SA')} ريال`;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'غير محدد';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
    }
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return "storefront-outline";

    switch (category) {
      case 'إلكترونيات': return "phone-portrait-outline";
      case 'سيارات': return "car-outline";
      case 'عقارات': return "home-outline";
      case 'أثاث': return "bed-outline";
      case 'ملابس': return "shirt-outline";
      case 'رياضة': return "football-outline";
      case 'كتب': return "book-outline";
      case 'خدمات': return "briefcase-outline";
      case 'وظائف': return "business-outline";
      case 'حيوانات': return "paw-outline";
      default: return "storefront-outline";
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate('KenzEdit', { itemId: item._id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            if (!item) return;

            setDeleting(true);
            try {
              await deleteKenz(item._id);
              Alert.alert("نجح", "تم حذف الإعلان بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف الإعلان:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف الإعلان");
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
      const message = `إعلان في كنز: ${item.title}\n\n${item.description || ''}\n\nالسعر: ${formatCurrency(item.price)}\nالفئة: ${item.category || 'غير محدد'}\n${item.metadata ? `\nالتفاصيل: ${Object.entries(item.metadata).map(([key, value]) => `${key}: ${value}`).join(', ')}` : ''}\n\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  /**
   * توحيد رقم الهاتف: دعم +966، 966، 05، 5 (سعودي) و +967، 967 (يمني)
   */
  const normalizePhoneNumber = (phone: string): string | null => {
    if (!phone || typeof phone !== "string") return null;
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 8) return null;
    // سعودي: 966 أو 5XXXXXXXX
    if (/^966\d{9}$/.test(digits)) return `+${digits}`;
    if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
    if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`;
    // يمني: 967 أو 7XXXXXXXX
    if (/^967\d{8,}$/.test(digits)) return `+${digits}`;
    if (/^7\d{8}$/.test(digits)) return `+967${digits}`;
    if (/^0\d{8,}$/.test(digits)) return `+967${digits.slice(1)}`;
    // غير ذلك: نعيد كما هو مع +
    if (digits.length >= 9) return `+${digits}`;
    return null;
  };

  const handleCall = () => {
    const raw = item?.metadata?.contact;
    if (!raw) {
      Alert.alert("تنبيه", "لم يُذكر رقم تواصل في هذا الإعلان.");
      return;
    }

    const normalized = normalizePhoneNumber(raw);
    if (!normalized) {
      Alert.alert("خطأ", "رقم التواصل غير صالح. تأكد من أنه رقم هاتف صحيح.");
      return;
    }

    const url = `tel:${normalized}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("خطأ", "لا يمكن إجراء المكالمة من هذا الجهاز.");
        }
      })
      .catch((err) => {
        console.error("خطأ في فتح تطبيق الهاتف:", err);
        Alert.alert("خطأ", "تعذر فتح تطبيق الهاتف. تحقق من صلاحيات التطبيق.");
      });
  };

  const handleChatWithOwner = async () => {
    if (!item || !user) return;
    if (user.uid === (typeof item.ownerId === "object" ? (item.ownerId as any)?._id : item.ownerId)) {
      Alert.alert("تنبيه", "لا يمكنك التواصل مع نفسك.");
      return;
    }
    setStartingChat(true);
    try {
      const conv = await createConversation(item._id);
      navigation.navigate("KenzChat", { conversationId: conv._id });
    } catch (e: any) {
      console.error("خطأ في بدء المحادثة:", e);
      const msg = e?.response?.data?.userMessage || e?.message || "فشل في بدء المحادثة.";
      Alert.alert("خطأ", msg);
    } finally {
      setStartingChat(false);
    }
  };

  const handleOpenChatList = () => {
    navigation.navigate("KenzChatList");
  };

  const ownerIdStr =
    item &&
    (typeof item.ownerId === "object" && (item.ownerId as any)?._id
      ? String((item.ownerId as any)._id)
      : String(item.ownerId || ""));
  const isOwner = !!(user && item && ownerIdStr === user.uid);
  const hasContact = !!(item?.metadata?.contact);

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
        <Text style={styles.errorText}>لم يتم العثور على الإعلان</Text>
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
        <Text style={styles.headerTitle}>تفاصيل الإعلان</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          {isOwner && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenChatList}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
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
            <View style={styles.categoryContainer}>
              <Ionicons
                name={getCategoryIcon(item.category)}
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.categoryText}>{item.category || 'غير مصنف'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Price */}
          {item.price && (
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>السعر</Text>
              <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
            </View>
          )}

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Category */}
          {item.category && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>الفئة</Text>
              <View style={styles.categoryDisplay}>
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.categoryValue}>{item.category}</Text>
              </View>
            </View>
          )}

          {/* التواصل: محادثة + اتصال */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>التواصل</Text>
            <View style={styles.contactActions}>
              {!isOwner && user && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.chatButton]}
                  onPress={handleChatWithOwner}
                  disabled={startingChat}
                >
                  {startingChat ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.white} />
                      <Text style={styles.contactButtonText}>تواصل مع المعلن</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {hasContact && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.callButton]}
                  onPress={handleCall}
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.white} />
                  <Text style={styles.contactButtonText}>اتصال مباشر</Text>
                </TouchableOpacity>
              )}
            </View>
            {hasContact && (
              <Text style={styles.phoneDisplay}>
                رقم التواصل: {normalizePhoneNumber(item.metadata.contact) ?? item.metadata.contact}
              </Text>
            )}
            {!hasContact && !isOwner && user && (
              <Text style={styles.noContactHint}>لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن أعلاه.</Text>
            )}
          </View>

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              {Object.entries(item.metadata)
                .filter(([k]) => k !== "contact")
                .map(([key, value]) => (
                  <View key={key} style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>{key}:</Text>
                    <Text style={styles.metadataValue}>{String(value)}</Text>
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
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.updatedAt)}
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
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
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
    fontFamily: "Cairo-SemiBold",
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginLeft: 6,
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
  priceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 28,
    fontFamily: "Cairo-Bold",
    color: COLORS.success,
    textAlign: 'center',
    backgroundColor: COLORS.lightGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  categoryValue: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginLeft: 8,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    width: 80,
  },
  metadataValue: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    flex: 1,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
  },
  callButton: {
    backgroundColor: COLORS.success ?? "#22c55e",
  },
  contactButtonText: {
    fontSize: 15,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  phoneDisplay: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 8,
  },
  noContactHint: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 8,
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

export default KenzDetailsScreen;
