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
import { MaaroufItem } from "@/types/types";
import { getMaaroufDetails, deleteMaarouf } from "@/api/maaroufApi";
import { createConversation } from "@/api/maaroufChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "MaaroufDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MaaroufDetails">;

const MaaroufDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<MaaroufItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getMaaroufDetails(itemId);
      setItem(itemData);
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل المعروف:", error);
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

  const getKindText = (kind?: string) => {
    switch (kind) {
      case 'lost': return 'شيء مفقود';
      case 'found': return 'شيء موجود';
      default: return 'غير محدد';
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate('MaaroufEdit', { itemId: item._id });
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
              await deleteMaarouf(item._id);
              Alert.alert("نجح", "تم حذف الإعلان بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف المعروف:", error);
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
      const message = `${getKindText(item.kind)}: ${item.title}\n\n${item.description || ''}\n\nالعلامات: ${item.tags?.join(', ') || 'لا توجد علامات'}\n\nتاريخ النشر: ${new Date(item.createdAt).toLocaleDateString('ar-SA')}`;

      await Share.share({
        message,
        title: item.title,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
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
      navigation.navigate("MaaroufChat", { conversationId: conv._id });
    } catch (e: any) {
      console.error("خطأ في بدء المحادثة:", e);
      const msg = e?.response?.data?.userMessage || e?.message || "فشل في بدء المحادثة.";
      Alert.alert("خطأ", msg);
    } finally {
      setStartingChat(false);
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
            <View style={styles.kindContainer}>
              <Text style={styles.kindText}>{getKindText(item.kind)}</Text>
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

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>العلامات</Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>بيانات إضافية</Text>
              {item.metadata.color && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>اللون:</Text>
                  <Text style={styles.metadataValue}>{item.metadata.color}</Text>
                </View>
              )}
              {item.metadata.location && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>الموقع:</Text>
                  <Text style={styles.metadataValue}>{item.metadata.location}</Text>
                </View>
              )}
              {item.metadata.date && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>التاريخ:</Text>
                  <Text style={styles.metadataValue}>{item.metadata.date}</Text>
                </View>
              )}
              {item.metadata.contact && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>معلومات التواصل:</Text>
                  <Text style={styles.metadataValue}>{item.metadata.contact}</Text>
                </View>
              )}
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
              {item.metadata?.contact && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.callButton]}
                  onPress={() => {
                    const phone = item.metadata?.contact;
                    if (phone) {
                      const phoneNumber = phone.replace(/[^0-9+]/g, '');
                      Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
                        console.error("خطأ في فتح تطبيق الهاتف:", err);
                        Alert.alert("خطأ", "تعذر فتح تطبيق الهاتف.");
                      });
                    }
                  }}
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.white} />
                  <Text style={styles.contactButtonText}>اتصال مباشر</Text>
                </TouchableOpacity>
              )}
            </View>
            {item.metadata?.contact && (
              <Text style={styles.phoneDisplay}>
                رقم التواصل: {item.metadata.contact}
              </Text>
            )}
            {!item.metadata?.contact && !isOwner && user && (
              <Text style={styles.noContactHint}>لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن أعلاه.</Text>
            )}
          </View>

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
    fontFamily: 'Cairo-Regular',
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
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
    fontFamily: 'Cairo-SemiBold',
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
  kindContainer: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kindText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.text,
    width: 100,
  },
  metadataValue: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: COLORS.textLight,
    flex: 1,
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
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.text,
    width: 100,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: COLORS.textLight,
    flex: 1,
  },
  contactSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  contactButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Cairo-SemiBold',
    marginLeft: 8,
  },
  phoneDisplay: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: COLORS.textLight,
    marginTop: 12,
    textAlign: "center",
  },
  noContactHint: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: COLORS.gray,
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default MaaroufDetailsScreen;
