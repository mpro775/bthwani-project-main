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
  Image,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { KenzItem } from "@/types/types";
import {
  getKenzDetails,
  deleteKenz,
  markKenzAsSold,
  reportKenz,
  getKenzFavorites,
  addKenzFavorite,
  removeKenzFavorite,
  buyWithEscrow,
  placeBid,
  getKenzBids,
  type KenzBidItem,
} from "@/api/kenzApi";
import { createConversation } from "@/api/kenzChatApi";
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GALLERY_HEIGHT = 220;

type RouteProps = RouteProp<RootStackParamList, "KenzDetails">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KenzDetails"
>;

const KenzDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user, isLoggedIn } = useAuth();

  const [item, setItem] = useState<KenzItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [escrowModalVisible, setEscrowModalVisible] = useState(false);
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowSubmitting, setEscrowSubmitting] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bids, setBids] = useState<KenzBidItem[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  // استنتاج هوية المستخدم الحالي (لإخفاء زر التواصل عن صاحب الإعلان)
  useEffect(() => {
    (async () => {
      let uid = user?.uid ?? null;
      if (!uid && isLoggedIn) {
        uid = await AsyncStorage.getItem("userId");
        if (!uid) {
          try {
            const profile = await fetchUserProfile();
            uid =
              profile?.uid || profile?.id || profile?._id
                ? String(profile.uid || profile.id || profile._id)
                : null;
          } catch {
            // تجاهل
          }
        }
      }
      setCurrentUserId(uid);
    })();
  }, [user?.uid, isLoggedIn]);

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

  useEffect(() => {
    if (!itemId || !isLoggedIn) return;
    getKenzFavorites()
      .then((res) => {
        const found = (res?.items ?? []).some((i) => i._id === itemId);
        setIsFavorited(found);
      })
      .catch(() => setIsFavorited(false));
  }, [itemId, isLoggedIn]);

  useEffect(() => {
    if (item?.isAuction && item?._id) {
      setBidsLoading(true);
      getKenzBids(item._id)
        .then((res) => setBids(res.items ?? []))
        .catch(() => setBids([]))
        .finally(() => setBidsLoading(false));
    } else {
      setBids([]);
    }
  }, [item?._id, item?.isAuction]);

  useEffect(() => {
    if (!item?.isAuction || !item?.auctionEndAt) return;
    const end = new Date(item.auctionEndAt).getTime();
    const tick = () => {
      const now = Date.now();
      if (now >= end) {
        setCountdown("انتهى المزاد");
        return;
      }
      const diff = end - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}يوم ${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [item?.isAuction, item?.auctionEndAt]);

  const handleFavoriteToggle = async () => {
    if (!item) return;
    setFavoriteLoading(true);
    const prev = isFavorited;
    setIsFavorited(!prev);
    try {
      if (prev) await removeKenzFavorite(item._id);
      else await addKenzFavorite(item._id);
    } catch {
      setIsFavorited(prev);
    } finally {
      setFavoriteLoading(false);
    }
  };

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
        return "متاح";
      case "completed":
        return "مباع";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const formatCurrency = (price?: number, currency?: string) => {
    if (!price) return "غير محدد";
    const cur = currency ?? "ريال يمني";
    return `${price.toLocaleString("ar-SA")} ${cur}`;
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

  const getCategoryIcon = (category?: string) => {
    if (!category) return "storefront-outline";

    switch (category) {
      case "إلكترونيات":
        return "phone-portrait-outline";
      case "سيارات":
        return "car-outline";
      case "عقارات":
        return "home-outline";
      case "أثاث":
        return "bed-outline";
      case "ملابس":
        return "shirt-outline";
      case "رياضة":
        return "football-outline";
      case "كتب":
        return "book-outline";
      case "خدمات":
        return "briefcase-outline";
      case "وظائف":
        return "business-outline";
      case "حيوانات":
        return "paw-outline";
      default:
        return "storefront-outline";
    }
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate("KenzEdit", { itemId: item._id });
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
      const message = `إعلان في كنز: ${item.title}\n\n${
        item.description || ""
      }\n\nالسعر: ${formatCurrency(item.price, item.currency)}\nالفئة: ${
        item.category || "غير محدد"
      }\n${item.city ? `المدينة: ${item.city}\n` : ""}${
        item.metadata
          ? `\nالتفاصيل: ${Object.entries(item.metadata)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}`
          : ""
      }\n\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${formatDate(
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
    if (!item) return;
    const ownerIdStr =
      typeof item.ownerId === "object" && (item.ownerId as any)?._id
        ? String((item.ownerId as any)._id)
        : String(item.ownerId || "");
    let uid = currentUserId ?? user?.uid ?? null;
    if (!uid && isLoggedIn) {
      uid = await AsyncStorage.getItem("userId");
      if (!uid) {
        try {
          const profile = await fetchUserProfile();
          uid =
            profile?.uid || profile?.id || profile?._id
              ? String(profile.uid || profile.id || profile._id)
              : null;
        } catch {
          // تجاهل
        }
      }
    }
    if (!uid) {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولاً للمحادثة.");
      return;
    }
    if (uid === ownerIdStr) {
      Alert.alert("تنبيه", "لا يمكنك التواصل مع نفسك.");
      return;
    }
    setStartingChat(true);
    try {
      const conv = await createConversation(item._id);
      navigation.navigate("KenzChat", { conversationId: conv._id });
    } catch (e: any) {
      console.error("خطأ في بدء المحادثة:", e);
      const msg =
        e?.response?.data?.userMessage || e?.message || "فشل في بدء المحادثة.";
      Alert.alert("خطأ", msg);
    } finally {
      setStartingChat(false);
    }
  };

  const handleOpenChatList = () => {
    navigation.navigate("KenzChatList");
  };

  const handleMarkSold = async () => {
    if (!item) return;
    Alert.alert("تم البيع", "هل تريد تعليم هذا الإعلان كمباع؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "نعم",
        onPress: async () => {
          setMarkingSold(true);
          try {
            const updated = await markKenzAsSold(item._id);
            setItem(updated);
            Alert.alert("تم", "تم تعليم الإعلان كمباع بنجاح");
          } catch (e: any) {
            const msg =
              e?.response?.data?.message ||
              e?.message ||
              "فشل في تعليم الإعلان كمباع";
            Alert.alert("خطأ", msg);
          } finally {
            setMarkingSold(false);
          }
        },
      },
    ]);
  };

  const handleReportSubmit = async () => {
    if (!item || !reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      await reportKenz(item._id, {
        reason: reportReason.trim(),
        notes: reportNotes.trim() || undefined,
      });
      setReportModalVisible(false);
      setReportReason("");
      setReportNotes("");
      Alert.alert("تم", "تم إرسال البلاغ بنجاح");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "فشل في إرسال البلاغ أو أنك أبلغت مسبقاً";
      Alert.alert("خطأ", msg);
    } finally {
      setReportSubmitting(false);
    }
  };

  const ownerIdStr =
    item &&
    (typeof item.ownerId === "object" && (item.ownerId as any)?._id
      ? String((item.ownerId as any)._id)
      : String(item.ownerId || ""));
  const isOwner = !!(currentUserId && item && ownerIdStr === currentUserId);
  const hasContact = !!item?.metadata?.contact;

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
              {item.status !== "completed" && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleMarkSold}
                  disabled={markingSold}
                >
                  {markingSold ? (
                    <ActivityIndicator size="small" color={COLORS.success} />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={COLORS.success}
                    />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenChatList}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
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
          {!isOwner && isLoggedIn && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavoriteToggle}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorited ? COLORS.danger : COLORS.text}
                />
              )}
            </TouchableOpacity>
          )}
          {!isOwner && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReportModalVisible(true)}
            >
              <Ionicons
                name="flag-outline"
                size={20}
                color={COLORS.orangeDark}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Image gallery */}
          {(item.images ?? []).length > 0 ? (
            <FlatList
              data={item.images!}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `img-${i}`}
              renderItem={({ item: img }) => (
                <Image
                  source={{ uri: img }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              )}
              style={styles.gallery}
            />
          ) : (
            <View style={[styles.gallery, styles.galleryPlaceholder]}>
              <Ionicons name="image-outline" size={64} color={COLORS.gray} />
              <Text style={styles.galleryPlaceholderText}>لا توجد صور</Text>
            </View>
          )}

          {/* Header Info */}
          <View style={styles.infoHeader}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View style={styles.categoryContainer}>
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.categoryText}>
                  {item.category || "غير مصنف"}
                </Text>
              </View>
              {item.isAuction && (
                <View
                  style={[
                    styles.boostBadge,
                    { backgroundColor: COLORS.info || "#0ea5e9" },
                  ]}
                >
                  <Ionicons
                    name="hammer-outline"
                    size={14}
                    color={COLORS.background}
                  />
                  <Text style={styles.boostBadgeText}>مزاد</Text>
                </View>
              )}
              {item.isBoosted && (
                <View style={styles.boostBadge}>
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color={COLORS.background}
                  />
                  <Text style={styles.boostBadgeText}>إعلان مميز</Text>
                </View>
              )}
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

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* City, views, quantity, currency */}
          <View style={styles.metaRow}>
            {item.city && (
              <View style={styles.metaChip}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.metaChipText}>{item.city}</Text>
              </View>
            )}
            {(item.viewCount ?? 0) > 0 && (
              <View style={styles.metaChip}>
                <Ionicons name="eye-outline" size={14} color={COLORS.gray} />
                <Text style={styles.metaChipText}>{item.viewCount} مشاهدة</Text>
              </View>
            )}
            {(item.quantity ?? 1) > 1 && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>الكمية: {item.quantity}</Text>
              </View>
            )}
          </View>

          {/* طريقة التسليم */}
          {item.deliveryOption && (
            <Text style={styles.postedOnBehalfText}>
              طريقة التسليم:{" "}
              {item.deliveryOption === "meetup"
                ? "لقاء"
                : item.deliveryOption === "delivery"
                ? item.deliveryFee
                  ? `توصيل (${item.deliveryFee} ر.ي)`
                  : "توصيل"
                : item.deliveryFee
                ? `لقاء أو توصيل (${item.deliveryFee} ر.ي)`
                : "لقاء وتوصيل"}
            </Text>
          )}

          {/* نشر بالنيابة عن */}
          {(item.postedOnBehalfOfPhone ||
            (typeof item.postedOnBehalfOfUserId === "object" &&
              item.postedOnBehalfOfUserId)) && (
            <Text style={styles.postedOnBehalfText}>
              نُشر بالنيابة عن:{" "}
              {typeof item.postedOnBehalfOfUserId === "object" &&
              item.postedOnBehalfOfUserId?.name
                ? item.postedOnBehalfOfUserId.name
                : item.postedOnBehalfOfPhone
                ? `${String(item.postedOnBehalfOfPhone).replace(
                    /(\d{3})\d+(\d{3})/,
                    "$1***$2"
                  )}`
                : ""}
            </Text>
          )}

          {/* Price */}
          {(item.price != null || item.startingPrice != null || item.winningBidAmount != null) && (
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>
                {item.isAuction ? "المزاد" : "السعر"}
              </Text>
              <Text style={styles.priceText}>
                {item.isAuction && item.winningBidAmount != null
                  ? formatCurrency(item.winningBidAmount, item.currency)
                  : item.isAuction
                  ? formatCurrency(item.startingPrice ?? item.price, item.currency)
                  : formatCurrency(item.price, item.currency)}
              </Text>
              {item.isAuction && countdown && (
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: COLORS.info || "#0ea5e9",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ color: COLORS.white, fontFamily: "Cairo-SemiBold", fontSize: 14 }}>
                    {countdown}
                  </Text>
                </View>
              )}
              {item.isAuction && item.winnerId && (
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: COLORS.success,
                    fontFamily: "Cairo-SemiBold",
                  }}
                >
                  الفائز:{" "}
                  {typeof item.winnerId === "object" && item.winnerId
                    ? item.winnerId.fullName || item.winnerId.phone || "—"
                    : "—"}
                </Text>
              )}
            </View>
          )}

          {/* Bids list (for auctions) */}
          {item.isAuction && (
            <View style={[styles.priceSection, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>المزايدات</Text>
              {bidsLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : bids.length === 0 ? (
                <Text style={styles.postedOnBehalfText}>لا توجد مزايدات حتى الآن</Text>
              ) : (
                bids.map((bid) => (
                  <View
                    key={bid._id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.lightGray,
                    }}
                  >
                    <Text style={styles.metaChipText}>
                      {typeof bid.bidderId === "object" && bid.bidderId
                        ? bid.bidderId.fullName || bid.bidderId.phone || "—"
                        : "—"}
                    </Text>
                    <Text
                      style={[styles.priceText, { fontSize: 14, marginLeft: 0 }]}
                    >
                      {formatCurrency(bid.amount, item.currency)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Keywords */}
          {(item.keywords ?? []).length > 0 && (
            <View style={styles.keywordsSection}>
              <Text style={styles.sectionTitle}>كلمات مفتاحية</Text>
              <View style={styles.keywordsRow}>
                {(item.keywords ?? []).map((kw, i) => (
                  <View key={i} style={styles.keywordChip}>
                    <Text style={styles.keywordChipText}>{kw}</Text>
                  </View>
                ))}
              </View>
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

          {/* لصاحب الإعلان: إدارة الإعلان (تعديل، محادثاتي، حذف) */}
          {isOwner && (
            <View style={styles.ownerSection}>
              <Text style={styles.sectionTitle}>إدارة إعلانك</Text>
              <Text style={styles.ownerHint}>
                يمكنك تعديل بيانات الإعلان أو حذفه أو متابعة المحادثات مع
                المهتمين.
              </Text>
              <View style={styles.ownerActions}>
                {item.status !== "completed" && (
                  <TouchableOpacity
                    style={[
                      styles.ownerButton,
                      { backgroundColor: COLORS.success },
                    ]}
                    onPress={handleMarkSold}
                    disabled={markingSold}
                  >
                    {markingSold ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={22}
                          color={COLORS.white}
                        />
                        <Text style={styles.ownerButtonText}>تم البيع</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.ownerButton, styles.ownerButtonEdit]}
                  onPress={handleEdit}
                >
                  <Ionicons name="pencil" size={22} color={COLORS.white} />
                  <Text style={styles.ownerButtonText}>تعديل البيانات</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ownerButton, styles.ownerButtonChat]}
                  onPress={handleOpenChatList}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={22}
                    color={COLORS.white}
                  />
                  <Text style={styles.ownerButtonText}>محادثاتي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ownerButton, styles.ownerButtonDelete]}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color={COLORS.white}
                      />
                      <Text style={styles.ownerButtonText}>حذف الإعلان</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* للزائر: التواصل (محادثة + اتصال + شراء بالإيكرو) */}
          {!isOwner && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>التواصل</Text>
              <View style={styles.contactActions}>
                {item.isAuction &&
                  item.status !== "completed" &&
                  item.status !== "cancelled" &&
                  !item.winnerId &&
                  countdown !== "انتهى المزاد" &&
                  (currentUserId || user) && (
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        { backgroundColor: COLORS.info || "#0ea5e9" },
                      ]}
                      onPress={() => {
                        const min =
                          bids.length > 0 && bids[0]
                            ? bids[0].amount + 1
                            : (item.startingPrice ?? item.price ?? 0) + 1;
                        setBidAmount(String(min));
                        setBidModalVisible(true);
                      }}
                    >
                      <Ionicons
                        name="hammer-outline"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.contactButtonText}>مزايدة</Text>
                    </TouchableOpacity>
                  )}
                {item.acceptsEscrow &&
                  item.status !== "completed" &&
                  item.status !== "cancelled" &&
                  (currentUserId || user) && (
                    <TouchableOpacity
                      style={[styles.contactButton, styles.escrowButton]}
                      onPress={() => {
                        setEscrowAmount(String(item.price ?? ""));
                        setEscrowModalVisible(true);
                      }}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.contactButtonText}>
                        شراء بالإيكرو
                      </Text>
                    </TouchableOpacity>
                  )}
                {(currentUserId || user) && (
                  <TouchableOpacity
                    style={[styles.contactButton, styles.chatButton]}
                    onPress={handleChatWithOwner}
                    disabled={startingChat}
                  >
                    {startingChat ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={18}
                          color={COLORS.white}
                        />
                        <Text style={styles.contactButtonText}>
                          تواصل مع المعلن
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {hasContact && (
                  <TouchableOpacity
                    style={[styles.contactButton, styles.callButton]}
                    onPress={handleCall}
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.contactButtonText}>اتصال مباشر</Text>
                  </TouchableOpacity>
                )}
              </View>
              {hasContact && (
                <Text style={styles.phoneDisplay}>
                  رقم التواصل:{" "}
                  {normalizePhoneNumber(item.metadata.contact) ??
                    item.metadata.contact}
                </Text>
              )}
              {!hasContact && (currentUserId || user) && (
                <Text style={styles.noContactHint}>
                  لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن
                  أعلاه.
                </Text>
              )}
            </View>
          )}

          {/* Escrow modal */}
          <Modal
            visible={escrowModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() =>
              !escrowSubmitting && setEscrowModalVisible(false)
            }
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>شراء بالإيكرو</Text>
                <Text style={styles.modalHint}>
                  سيتم حجز المبلغ من محفظتك حتى تؤكد استلام السلعة.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="المبلغ"
                  placeholderTextColor={COLORS.textLight}
                  value={escrowAmount}
                  onChangeText={setEscrowAmount}
                  keyboardType="numeric"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setEscrowModalVisible(false)}
                    disabled={escrowSubmitting}
                  >
                    <Text style={styles.modalCancelText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      escrowSubmitting && styles.modalButtonDisabled,
                    ]}
                    onPress={async () => {
                      const amt = parseFloat(escrowAmount);
                      if (!amt || amt < 1) {
                        Alert.alert("خطأ", "أدخل مبلغاً صحيحاً");
                        return;
                      }
                      setEscrowSubmitting(true);
                      try {
                        await buyWithEscrow(item._id, amt);
                        setEscrowModalVisible(false);
                        Alert.alert(
                          "تم",
                          "تم إنشاء الصفقة. يمكنك متابعة الصفقة من صفقاتي."
                        );
                        navigation.navigate("KenzDeals");
                      } catch (e: any) {
                        const msg =
                          e?.response?.data?.userMessage ||
                          e?.message ||
                          "فشل في إنشاء الصفقة. تحقق من رصيد المحفظة.";
                        Alert.alert("خطأ", msg);
                      } finally {
                        setEscrowSubmitting(false);
                      }
                    }}
                    disabled={escrowSubmitting}
                  >
                    {escrowSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalConfirmText}>تأكيد الشراء</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Bid modal */}
          <Modal
            visible={bidModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() =>
              !bidSubmitting && setBidModalVisible(false)
            }
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>مزايدة</Text>
                <Text style={styles.modalHint}>
                  السعر الابتدائي:{" "}
                  {formatCurrency(
                    item.startingPrice ?? item.price,
                    item.currency
                  )}
                </Text>
                {bids.length > 0 && bids[0] && (
                  <Text style={styles.modalHint}>
                    أعلى مزايدة حالياً:{" "}
                    {formatCurrency(bids[0].amount, item.currency)}
                  </Text>
                )}
                <TextInput
                  style={styles.modalInput}
                  placeholder="المبلغ"
                  placeholderTextColor={COLORS.textLight}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  keyboardType="numeric"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setBidModalVisible(false)}
                    disabled={bidSubmitting}
                  >
                    <Text style={styles.modalCancelText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      bidSubmitting && styles.modalButtonDisabled,
                    ]}
                    onPress={async () => {
                      const amt = parseFloat(bidAmount);
                      const min =
                        bids.length > 0 && bids[0]
                          ? bids[0].amount + 1
                          : (item.startingPrice ?? item.price ?? 0) + 1;
                      if (!amt || amt < min) {
                        Alert.alert(
                          "خطأ",
                          `المبلغ يجب أن يكون أكبر من ${min}`
                        );
                        return;
                      }
                      setBidSubmitting(true);
                      try {
                        await placeBid(item._id, amt);
                        setBidModalVisible(false);
                        setBidAmount("");
                        Alert.alert("تم", "تمت المزايدة بنجاح");
                        loadItem();
                      } catch (e: any) {
                        const msg =
                          e?.response?.data?.message ||
                          e?.message ||
                          "فشل في المزايدة. تأكد أن المبلغ أكبر من أعلى مزايدة.";
                        Alert.alert("خطأ", msg);
                      } finally {
                        setBidSubmitting(false);
                      }
                    }}
                    disabled={bidSubmitting}
                  >
                    {bidSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalConfirmText}>تأكيد المزايدة</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
              <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>{formatDate(item.updatedAt)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>الإبلاغ عن إعلان</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="سبب الإبلاغ (مطلوب)"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <TextInput
              style={[styles.reportInput, styles.reportNotes]}
              placeholder="ملاحظات (اختياري)"
              value={reportNotes}
              onChangeText={setReportNotes}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButtonSubmit,
                  !reportReason.trim() && styles.modalButtonDisabled,
                ]}
                onPress={handleReportSubmit}
                disabled={!reportReason.trim() || reportSubmitting}
              >
                {reportSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalButtonSubmitText}>إرسال البلاغ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  gallery: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    marginHorizontal: -16,
    marginBottom: 16,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
  },
  galleryPlaceholder: {
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryPlaceholderText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  metaChipText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 4,
  },
  postedOnBehalfText: {
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 4,
  },
  keywordsSection: {
    marginBottom: 24,
  },
  keywordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  keywordChip: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordChipText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: COLORS.primary,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  boostBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orangeDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  boostBadgeText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
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
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
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
  ownerSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ownerHint: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginBottom: 16,
  },
  ownerActions: {
    gap: 12,
  },
  ownerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  ownerButtonEdit: {
    backgroundColor: COLORS.primary,
  },
  ownerButtonChat: {
    backgroundColor: COLORS.success ?? "#22c55e",
  },
  ownerButtonDelete: {
    backgroundColor: COLORS.danger,
  },
  ownerButtonText: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
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
  escrowButton: {
    backgroundColor: "#059669",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalHint: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelButton: {
    padding: 12,
  },
  modalCancelText: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    marginBottom: 12,
    minHeight: 44,
  },
  reportNotes: {
    minHeight: 64,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  modalButtonSubmit: {
    backgroundColor: COLORS.orangeDark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonSubmitText: {
    fontSize: 15,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});

export default KenzDetailsScreen;
