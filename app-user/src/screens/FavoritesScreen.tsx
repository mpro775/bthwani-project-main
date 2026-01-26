// screens/MyFavoritesScreen.tsx
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { getAuthBanner } from "@/guards/bannerGateway";
import { RootStackParamList } from "@/types/navigation";
import { FavoriteItem, FavoriteType } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  I18nManager,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllUserFavorites, removeFavorite } from "../api/favorites";

type Tab = "all" | "restaurant" | "product";

const MyFavoritesScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const fadeIn = useRef(new Animated.Value(0)).current;
  type NavProps = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavProps>();

  // قراءة حالة المستخدم
  const { authReady, isLoggedIn } = useAuth();

  const handleOpen = (item: FavoriteItem) => {
    if (item.itemType === "restaurant") {
      // افتح صفحة المتجر
      navigation.navigate("BusinessDetails", {
        business: {
          _id: item.itemId,
          name: item.title,
          image: (item as any)?.image, // إن كانت موجودة في السnapshot
          category: { usageType: "restaurant" },
        },
      } as any);
    } else {
      // منتج — الأفضل نكون خزّنا storeId + storeType في السnapshot (انظر الخطوة 2)
      const storeId = (item as any).storeId || (item as any)?.snapshot?.storeId;
      const storeType =
        (item as any).storeType ||
        (item as any)?.snapshot?.storeType ||
        "restaurant";

      if (storeId) {
        navigation.navigate("BusinessDetails", {
          business: {
            _id: storeId,
            image: (item as any)?.image,
            category: { usageType: storeType }, // 'grocery' | 'restaurant'
          },
          // اختياري: إن أردت لاحقًا تمرير ID للتمرير إلى المنتج داخل صفحة المتجر
          // initialProductId: item.itemId,
        } as any);
      } else {
        // سقوط احتياطي: لا توجد شاشة تفاصيل منتج متاحة
        console.warn("Cannot navigate to product details: missing storeId");
      }
    }
  };
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      // ✅ ضيف؟ لا نحاول نقرأ من السيرفر
      if (authReady && !isLoggedIn) {
        setFavorites([]);
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
        return;
      }

      const data = await getAllUserFavorites();
      setFavorites(Array.isArray(data) ? data : []);
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      setFavorites([]);
    } finally {
      setRefreshing(false);
    }
  }, [fadeIn, authReady, isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const counts = useMemo(
    () => ({
      all: favorites.length,
      restaurant: favorites.filter((f) => f.itemType === "restaurant").length,
      product: favorites.filter((f) => f.itemType === "product").length,
    }),
    [favorites]
  );

  const filtered = useMemo(() => {
    if (tab === "all") return favorites;
    return favorites.filter((f) => f.itemType === tab);
  }, [favorites, tab]);

  const onRemove = async (id: string, type: FavoriteType) => {
    // Optimistic update
    setFavorites((prev) =>
      prev.filter((x) => !(x.itemId === id && x.itemType === type))
    );
    try {
      await removeFavorite(id, type as "product" | "restaurant");
    } catch {}
  };

  const renderRightActions = (item: FavoriteItem) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={styles.deletePill}
          onPress={() => onRemove(item.itemId, item.itemType as FavoriteType)}
          accessibilityRole="button"
          accessibilityLabel="حذف من المفضلة"
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.deleteText}>حذف</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    const thumb =
      (item as any)?.image ||
      (item as any)?.logo ||
      (item as any)?.thumbnail ||
      (item as any)?.photo;

    return (
      <Animated.View
        style={[
          styles.cardAnimated,
          {
            opacity: fadeIn,
            transform: [
              {
                translateY: fadeIn.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Swipeable
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleOpen(item)} // 👈 هنا الانتقال
            style={styles.card}
          >
            <View style={styles.itemRow}>
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.itemImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Ionicons name="image" size={18} color="#fff" />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text numberOfLines={1} style={styles.itemTitle}>
                  {item.title ?? "—"}
                </Text>
                <Text style={styles.itemType}>
                  {item.itemType === "product" ? "منتج" : "مطعم"}
                </Text>
              </View>

              {/* زر القلب يبقى كما هو */}
              <TouchableOpacity
                onPress={() =>
                  onRemove(item.itemId, item.itemType as FavoriteType)
                }
                style={styles.heartBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="إزالة من المفضلة"
              >
                <Ionicons name="heart" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["left", "right", "bottom"]} // 👈 لا نأخذ top من الـSafeAreaView
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>قائمة المفضلة</Text>
        <View style={styles.headerStats}>
          <View style={styles.statChip}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.statText}>الكل {counts.all}</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="restaurant" size={14} color="#fff" />
            <Text style={styles.statText}>مطاعم {counts.restaurant}</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="cube" size={14} color="#fff" />
            <Text style={styles.statText}>منتجات {counts.product}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(["all", "restaurant", "product"] as Tab[]).map((t) => {
          const isActive = tab === t;
          const label =
            t === "all" ? "الكل" : t === "restaurant" ? "المطاعم" : "المنتجات";
          const badge = counts[t];
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text
                  style={[styles.badgeText, isActive && styles.badgeTextActive]}
                >
                  {badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* كارت التنبيه للدخول/التوثيق */}
      {authReady && !isLoggedIn && (
        <AuthNoticeCard
          variant="login"
          onPress={() => getAuthBanner()?.show("login")}
        />
      )}
      {false && (
        <AuthNoticeCard
          variant="verify"
          onPress={() => getAuthBanner()?.show("verify")}
        />
      )}

      {/* List */}
      {refreshing && favorites.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جارِ التحميل...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.contentContainer,
            filtered.length === 0 && { flex: 1 },
          ]}
          data={filtered}
          keyExtractor={(i) => `${i.itemType}:${i.itemId}`}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={load}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            authReady && !isLoggedIn ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="heart-outline"
                    size={56}
                    color={COLORS.blue}
                  />
                </View>
                <Text style={styles.emptyTitle}>سجّل الدخول لرؤية مفضلتك</Text>
                <Text style={styles.emptyText}>
                  أنشئ حسابًا أو سجّل الدخول لمزامنة المفضلة والاحتفاظ بها
                  دائمًا.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statChip,
                    { marginTop: 12, backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => getAuthBanner()?.show("login")}
                  activeOpacity={0.9}
                >
                  <Ionicons name="log-in-outline" size={16} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Cairo-Bold",
                      fontSize: 13,
                    }}
                  >
                    تسجيل الدخول
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons
                    name="heart-outline"
                    size={56}
                    color={COLORS.blue}
                  />
                </View>
                <Text style={styles.emptyTitle}>لا توجد عناصر في المفضلة</Text>
                <Text style={styles.emptyText}>
                  أضف مطاعمك ومنتجاتك المفضلة لتصل لها بسرعة في أي وقت.
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", margin: 0 },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Cairo-Bold",
  },
  headerStats: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statText: { color: "#fff", fontSize: 12, fontFamily: "Cairo-Regular" },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lightGray,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  tabPillActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.dark,
  },
  tabText: { color: COLORS.text, fontSize: 13, fontFamily: "Cairo-Bold" },
  tabTextActive: { color: "#fff" },
  badge: {
    backgroundColor: "rgba(10,47,92,0.08)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeActive: { backgroundColor: COLORS.primary },
  badgeText: { color: COLORS.dark, fontSize: 11, fontFamily: "Cairo-Bold" },
  badgeTextActive: { color: "#fff" },

  contentContainer: { padding: 16, paddingBottom: 30 },
  cardAnimated: { width: "100%" },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: { flexDirection: "row", alignItems: "center" },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginHorizontal: I18nManager.isRTL ? 0 : 10,
    marginLeft: I18nManager.isRTL ? 10 : 0,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lightGray,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginHorizontal: I18nManager.isRTL ? 0 : 10,
    marginLeft: I18nManager.isRTL ? 10 : 0,
    backgroundColor: COLORS.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Cairo-Bold",
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  heartBtn: { padding: 6 },

  rightActionsContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  deletePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  deleteText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 12 },

  emptyContainer: {
    flex: 1,
    color: COLORS.blue,

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 86,
    height: 86,
    color: COLORS.blue,

    borderRadius: 999,
    backgroundColor: "rgba(232,64,47,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.blue,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Cairo-Regular",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: COLORS.gray, fontFamily: "Cairo-Regular" },

  // تنسيقات الكارت
  noticeWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    color: "#333",
    fontFamily: "Cairo-Regular",
    fontSize: 13,
  },
  noticeCta: {
    backgroundColor: "#D84315",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  noticeCtaText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 12 },
});

// كارت تنبيه صغير (نسخة خفيفة)
const AuthNoticeCard = ({
  variant,
  onPress,
}: {
  variant: "login" | "verify";
  onPress: () => void;
}) => (
  <View style={styles.noticeWrap}>
    <Ionicons
      name={variant === "login" ? "log-in-outline" : "shield-checkmark-outline"}
      size={18}
      color="#D84315"
    />
    <Text style={styles.noticeText}>
      {variant === "login"
        ? "سجّل الدخول لمزامنة مفضلتك عبر الأجهزة"
        : "وثّق حسابك لحفظ مفضلتك دون فقدان"}
    </Text>
    <TouchableOpacity onPress={onPress} style={styles.noticeCta}>
      <Text style={styles.noticeCtaText}>
        {variant === "login" ? "تسجيل الدخول" : "توثيق الآن"}
      </Text>
    </TouchableOpacity>
  </View>
);

export default MyFavoritesScreen;
