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
  Modal,
  TextInput,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { KawaderItem } from "@/types/types";
import {
  getKawaderDetails,
  deleteKawader,
  applyToKawader,
  getKawaderApplications,
  updateApplicationStatus,
  getPortfolioByUser,
  getReviewsByUser,
  createKawaderReview,
  type KawaderApplicationItem,
  type KawaderPortfolioItem,
  type KawaderReviewItem,
} from "@/api/kawaderApi";
import { createConversation } from "@/api/kawaderChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "KawaderDetails">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KawaderDetails"
>;

const KawaderDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState<KawaderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<KawaderApplicationItem[]>(
    []
  );
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsVisible, setApplicationsVisible] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<KawaderPortfolioItem[]>(
    []
  );
  const [reviews, setReviews] = useState<KawaderReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getKawaderDetails(itemId);
      setItem(itemData);
    } catch (error) {
      console.error("خطأ في تحميل تفاصيل الكادر:", error);
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
    return `${amount.toLocaleString("ar-SA")} ريال`;
  };

  const handleEdit = () => {
    if (item) {
      navigation.navigate("KawaderEdit", { itemId: item._id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا العرض الوظيفي؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            if (!item) return;

            setDeleting(true);
            try {
              await deleteKawader(item._id);
              Alert.alert("نجح", "تم حذف العرض الوظيفي بنجاح", [
                {
                  text: "موافق",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("خطأ في حذف الكادر:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف العرض الوظيفي");
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
      const message = `عرض وظيفي: ${item.title}\n\n${
        item.description || ""
      }\n\nالنطاق: ${item.scope || "غير محدد"}\nالميزانية: ${formatCurrency(
        item.budget
      )}\n${
        item.metadata?.location ? `الموقع: ${item.metadata.location}\n` : ""
      }${item.metadata?.remote ? "متاح العمل عن بعد\n" : ""}${
        item.metadata?.experience
          ? `الخبرة المطلوبة: ${item.metadata.experience}\n`
          : ""
      }${
        item.metadata?.skills && item.metadata.skills.length > 0
          ? `المهارات: ${item.metadata.skills.join(", ")}\n`
          : ""
      }\nالحالة: ${getStatusText(item.status)}\n\nتاريخ النشر: ${new Date(
        item.createdAt
      ).toLocaleDateString("ar-SA")}`;

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
    const ownerIdStr =
      typeof item.ownerId === "object"
        ? (item.ownerId as any)?._id
        : item.ownerId;
    if (user.uid === ownerIdStr) {
      Alert.alert("تنبيه", "لا يمكنك التواصل مع نفسك.");
      return;
    }
    setStartingChat(true);
    try {
      const conv = await createConversation(item._id);
      navigation.navigate("KawaderChat", { conversationId: conv._id });
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
    navigation.navigate("KawaderChatList");
  };

  const handleApplySubmit = async () => {
    if (!item || !user) return;
    setApplying(true);
    try {
      await applyToKawader(item._id, coverNote.trim() || undefined);
      setApplyModalVisible(false);
      setCoverNote("");
      Alert.alert(
        "تم",
        "تم إرسال تقديمك بنجاح. يمكنك متابعة التقديمات من قسم تقدماتي."
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.userMessage ||
        e?.message ||
        "فشل في إرسال التقديم";
      Alert.alert("خطأ", msg);
    } finally {
      setApplying(false);
    }
  };

  const loadApplications = useCallback(async () => {
    if (!itemId) return;
    setLoadingApplications(true);
    try {
      const res = await getKawaderApplications(itemId);
      setApplications(res.items ?? []);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [itemId]);

  const handleAcceptReject = async (
    appId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await updateApplicationStatus(appId, status);
      loadApplications();
    } catch (e: any) {
      Alert.alert("خطأ", e?.response?.data?.message || "فشل في تحديث الحالة");
    }
  };

  const getApplicantName = (app: KawaderApplicationItem) => {
    const u = app.userId;
    if (typeof u === "object" && u && "name" in u)
      return (u as any).name || "مستخدم";
    return "مستخدم";
  };

  const ownerIdStr =
    item &&
    (typeof item.ownerId === "object" && (item.ownerId as any)?._id
      ? String((item.ownerId as any)._id)
      : String(item.ownerId || ""));
  const isOwner = !!(user && item && ownerIdStr === user.uid);
  const hasContact = !!item?.metadata?.contact;

  const loadPortfolio = useCallback(async () => {
    if (!ownerIdStr) return;
    setLoadingPortfolio(true);
    try {
      const res = await getPortfolioByUser(ownerIdStr);
      setPortfolioItems(res.items ?? []);
    } catch {
      setPortfolioItems([]);
    } finally {
      setLoadingPortfolio(false);
    }
  }, [ownerIdStr]);

  const loadReviews = useCallback(async () => {
    if (!ownerIdStr) return;
    setLoadingReviews(true);
    try {
      const res = await getReviewsByUser(ownerIdStr);
      setReviews(res.items ?? []);
      setAverageRating(res.averageRating ?? 0);
      setReviewCount(res.reviewCount ?? 0);
    } catch {
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setLoadingReviews(false);
    }
  }, [ownerIdStr]);

  useEffect(() => {
    if (item && ownerIdStr) {
      loadPortfolio();
      loadReviews();
    }
  }, [item, ownerIdStr, loadPortfolio, loadReviews]);

  const handleReviewSubmit = async () => {
    if (!item || !user) return;
    setSubmittingReview(true);
    try {
      await createKawaderReview(
        item._id,
        reviewRating,
        reviewComment.trim() || undefined
      );
      setReviewModalVisible(false);
      setReviewComment("");
      setReviewRating(5);
      loadReviews();
    } catch (e: any) {
      Alert.alert("خطأ", e?.response?.data?.message || "فشل في إرسال التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getPortfolioMediaUrl = (p: KawaderPortfolioItem) => {
    const first = p.mediaIds?.[0];
    if (!first) return null;
    if (typeof first === "object" && first && "url" in first)
      return (first as any).url ?? null;
    return null;
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
        <Text style={styles.errorText}>لم يتم العثور على العرض الوظيفي</Text>
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
        <Text style={styles.headerTitle}>تفاصيل العرض الوظيفي</Text>
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
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Info */}
          <View style={styles.infoHeader}>
            <View style={styles.budgetContainer}>
              <Text style={styles.budgetText}>
                {formatCurrency(item.budget)}
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

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Scope */}
          {item.scope && (
            <View style={styles.scopeSection}>
              <Text style={styles.sectionTitle}>نطاق العمل</Text>
              <View style={styles.scopeContainer}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.scopeText}>{item.scope}</Text>
              </View>
            </View>
          )}

          {/* نوع العرض والموقع والراتب */}
          {(item.offerType ||
            item.jobType ||
            item.location ||
            item.salary != null) && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>التفاصيل</Text>
              {item.offerType && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>نوع العرض:</Text>
                  <Text style={styles.metadataValue}>
                    {item.offerType === "job" ? "وظيفة" : "عرض خدمة"}
                  </Text>
                </View>
              )}
              {item.jobType && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>نوع الوظيفة:</Text>
                  <Text style={styles.metadataValue}>
                    {item.jobType === "full_time"
                      ? "دوام كامل"
                      : item.jobType === "part_time"
                      ? "دوام جزئي"
                      : "عن بُعد"}
                  </Text>
                </View>
              )}
              {(item.location || item.metadata?.location) && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>الموقع:</Text>
                  <Text style={styles.metadataValue}>
                    {item.location || item.metadata?.location}
                  </Text>
                </View>
              )}
              {(item.salary != null || item.budget != null) && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>الراتب/الميزانية:</Text>
                  <Text style={styles.metadataValue}>
                    {formatCurrency(item.salary ?? item.budget)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Metadata */}
          {item.metadata && (
            <View style={styles.metadataSection}>
              <Text style={styles.sectionTitle}>متطلبات العمل</Text>

              {item.metadata.experience && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>الخبرة المطلوبة:</Text>
                  <Text style={styles.metadataValue}>
                    {item.metadata.experience}
                  </Text>
                </View>
              )}

              {item.metadata.skills && item.metadata.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Ionicons
                    name="construct-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.skillsTitle}>المهارات المطلوبة:</Text>
                  <View style={styles.skillsList}>
                    {item.metadata.skills.map((skill, index) => (
                      <Text key={index} style={styles.skill}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {item.metadata.location && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>الموقع:</Text>
                  <Text style={styles.metadataValue}>
                    {item.metadata.location}
                    {item.metadata.remote && " (متاح العمل عن بعد)"}
                  </Text>
                </View>
              )}

              {item.metadata.remote && !item.metadata.location && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.metadataLabel}>نوع العمل:</Text>
                  <Text style={styles.metadataValue}>عن بعد</Text>
                </View>
              )}
            </View>
          )}

          {/* للمالك: عرض التقديمات */}
          {isOwner && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>التقديمات على هذا العرض</Text>
              <TouchableOpacity
                style={[styles.contactButton, styles.chatButton]}
                onPress={() => {
                  setApplicationsVisible((v) => !v);
                  if (!applicationsVisible) loadApplications();
                }}
                disabled={loadingApplications}
              >
                {loadingApplications ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.contactButtonText}>
                      {applicationsVisible
                        ? "إخفاء التقديمات"
                        : "عرض التقديمات"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {applicationsVisible && applications.length > 0 && (
                <View style={styles.applicationsList}>
                  {applications.map((app) => (
                    <View key={app._id} style={styles.applicationCard}>
                      <Text style={styles.applicantName}>
                        {getApplicantName(app)}
                      </Text>
                      {app.coverNote ? (
                        <Text
                          style={styles.applicationCoverNote}
                          numberOfLines={2}
                        >
                          {app.coverNote}
                        </Text>
                      ) : null}
                      <View style={styles.applicationRow}>
                        <View
                          style={[
                            styles.appStatusBadge,
                            {
                              backgroundColor:
                                app.status === "accepted"
                                  ? COLORS.success
                                  : app.status === "rejected"
                                  ? COLORS.danger
                                  : COLORS.orangeDark,
                            },
                          ]}
                        >
                          <Text style={styles.appStatusText}>
                            {app.status === "pending"
                              ? "قيد المراجعة"
                              : app.status === "accepted"
                              ? "مقبول"
                              : "مرفوض"}
                          </Text>
                        </View>
                        {app.status === "pending" && (
                          <View style={styles.applicationActions}>
                            <TouchableOpacity
                              style={[
                                styles.appActionBtn,
                                { backgroundColor: COLORS.success },
                              ]}
                              onPress={() =>
                                handleAcceptReject(app._id, "accepted")
                              }
                            >
                              <Text style={styles.appActionText}>قبول</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.appActionBtn,
                                { backgroundColor: COLORS.danger },
                              ]}
                              onPress={() =>
                                handleAcceptReject(app._id, "rejected")
                              }
                            >
                              <Text style={styles.appActionText}>رفض</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {applicationsVisible &&
                applications.length === 0 &&
                !loadingApplications && (
                  <Text style={styles.noApplications}>لا توجد تقديمات بعد</Text>
                )}
            </View>
          )}

          {/* التواصل: محادثة + اتصال + تقدم الآن */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>التواصل</Text>
            <View style={styles.contactActions}>
              {!isOwner && user && (
                <>
                  <TouchableOpacity
                    style={[styles.contactButton, styles.applyButton]}
                    onPress={() => setApplyModalVisible(true)}
                  >
                    <Ionicons
                      name="send-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.contactButtonText}>تقدم الآن</Text>
                  </TouchableOpacity>
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
                </>
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
            {!hasContact && !isOwner && user && (
              <Text style={styles.noContactHint}>
                لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن
                أعلاه.
              </Text>
            )}
          </View>

          {/* معرض المعلن */}
          {(portfolioItems.length > 0 || loadingPortfolio) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>معرض المعلن</Text>
              {loadingPortfolio ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.portfolioScroll}
                >
                  {portfolioItems.map((p) => {
                    const thumb = getPortfolioMediaUrl(p);
                    return (
                      <View key={p._id} style={styles.portfolioCard}>
                        {thumb ? (
                          <Image
                            source={{ uri: thumb }}
                            style={styles.portfolioThumb}
                          />
                        ) : (
                          <View style={styles.portfolioThumbPlaceholder}>
                            <Ionicons
                              name="images-outline"
                              size={28}
                              color={COLORS.gray}
                            />
                          </View>
                        )}
                        {p.caption ? (
                          <Text
                            style={styles.portfolioCaption}
                            numberOfLines={2}
                          >
                            {p.caption}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* التقييمات */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>التقييمات</Text>
            <View style={styles.reviewsHeader}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={18} color={COLORS.orangeDark} />
                <Text style={styles.ratingText}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "—"} (
                  {reviewCount})
                </Text>
              </View>
              {!isOwner && user && (
                <TouchableOpacity
                  style={styles.addReviewBtn}
                  onPress={() => setReviewModalVisible(true)}
                >
                  <Text style={styles.addReviewBtnText}>أضف تقييماً</Text>
                </TouchableOpacity>
              )}
            </View>
            {loadingReviews ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.slice(0, 5).map((r) => (
                  <View key={r._id} style={styles.reviewCard}>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewRating}>
                        {(typeof r.reviewerId === "object" &&
                        r.reviewerId &&
                        "name" in r.reviewerId
                          ? (r.reviewerId as any).name
                          : "مستخدم") || "مستخدم"}
                      </Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Ionicons
                            key={i}
                            name={i <= r.rating ? "star" : "star-outline"}
                            size={14}
                            color={COLORS.orangeDark}
                          />
                        ))}
                      </View>
                    </View>
                    {r.comment ? (
                      <Text style={styles.reviewComment} numberOfLines={2}>
                        {r.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noReviews}>لا توجد تقييمات بعد</Text>
            )}
          </View>

          <Modal
            visible={applyModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setApplyModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>تقدم على هذا العرض</Text>
                <TextInput
                  style={styles.modalInput}
                  value={coverNote}
                  onChangeText={setCoverNote}
                  placeholder="رسالة تقديم (اختياري)..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setApplyModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalSubmitBtn,
                      applying && styles.modalSubmitDisabled,
                    ]}
                    onPress={handleApplySubmit}
                    disabled={applying}
                  >
                    {applying ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalSubmitText}>إرسال التقديم</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={reviewModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setReviewModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>تقييم المعلن</Text>
                <View style={styles.reviewStarsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setReviewRating(i)}
                      style={styles.reviewStarBtn}
                    >
                      <Ionicons
                        name={i <= reviewRating ? "star" : "star-outline"}
                        size={36}
                        color={COLORS.orangeDark}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.modalInput}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="تعليق (اختياري)"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setReviewModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalSubmitBtn,
                      submittingReview && styles.modalSubmitDisabled,
                    ]}
                    onPress={handleReviewSubmit}
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalSubmitText}>إرسال التقييم</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Dates */}
          <View style={styles.datesSection}>
            <Text style={styles.sectionTitle}>تواريخ مهمة</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>تاريخ النشر:</Text>
              <Text style={styles.dateValue}>
                {new Date(item.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>آخر تحديث:</Text>
              <Text style={styles.dateValue}>
                {new Date(item.updatedAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
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
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
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
  budgetContainer: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  budgetText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.success,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  scopeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  scopeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  scopeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: 8,
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
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  skillsContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 24,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 24,
  },
  skill: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
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
    fontWeight: "600",
    color: COLORS.text,
    width: 100,
  },
  dateValue: {
    fontSize: 14,
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
  applyButton: {
    backgroundColor: COLORS.orangeDark,
  },
  callButton: {
    backgroundColor: COLORS.success ?? "#22c55e",
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  phoneDisplay: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  noContactHint: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  applicationsList: {
    marginTop: 12,
    gap: 10,
  },
  applicationCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  applicationCoverNote: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  applicationRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  appStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  applicationActions: {
    flexDirection: "row",
    gap: 8,
    marginRight: "auto",
  },
  appActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
  noApplications: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  portfolioScroll: { marginBottom: 8 },
  portfolioCard: {
    width: 120,
    marginLeft: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  portfolioThumb: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.lightGray,
  },
  portfolioThumbPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioCaption: {
    fontSize: 12,
    color: COLORS.text,
    padding: 8,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  addReviewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  addReviewBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.white },
  reviewsList: { gap: 10 },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewRating: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 14, color: COLORS.textLight },
  noReviews: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  reviewStarsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginBottom: 16,
  },
  reviewStarBtn: { padding: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSubmitDisabled: {
    opacity: 0.6,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default KawaderDetailsScreen;
