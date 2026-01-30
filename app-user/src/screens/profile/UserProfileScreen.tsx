import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { RootStackParamList } from "@/types/navigation";
import { UserProfile } from "@/types/types";
import api from "@/utils/api/axiosInstance";
import { openExternal } from "@/utils/openExternal";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SP = 16;
const R = 16;

const SectionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.sectionButton}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Ionicons name={icon} size={20} color={COLORS.blue} />
    <Text style={styles.sectionButtonText} numberOfLines={1}>
      {label}
    </Text>
    <Ionicons name="chevron-back" size={18} color="#C2C8D0" />
  </TouchableOpacity>
);

export default function UserProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [eligibility, setEligibility] = useState<{
    canDelete: boolean;
    reasons: string[];
  } | null>(null);
  const [eligLoading, setEligLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  async function openDeleteDialog() {
    setDeleteOpen(true);
    setEligibility(null);
    setEligLoading(true);
    setConfirmText("");
    try {
      const { data } = await api.get<{ canDelete: boolean; reasons: string[] }>(
        "/users/me/delete-eligibility"
      );
      setEligibility(data);
    } catch (e: any) {
      setEligibility({
        canDelete: false,
        reasons: ["تعذّر التحقق من الإتاحة حاليًا. جرّب لاحقًا."],
      });
    } finally {
      setEligLoading(false);
    }
  }

  async function onConfirmDelete() {
    if (confirmText.trim() !== "حذف") {
      return Alert.alert("للمتابعة اكتب كلمة (حذف) في خانة التأكيد.");
    }
    if (!eligibility?.canDelete) return;

    setDeleteBusy(true);
    try {
      await api.delete("/users/me", {
        data: { reason: deleteReason || undefined }, // ← مهم في Axios
        headers: { "Content-Type": "application/json" },
      });

      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Auth" as any }] });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "حدث خطأ غير متوقع أثناء الحذف";
      Alert.alert(msg);
    } finally {
      setDeleteBusy(false);
    }
  }

  const loadProfile = async () => {
    setRefreshing(true);
    try {
      const user = await fetchUserProfile();
      setProfile(user);
    } catch {
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  // غير مسجل
  if (!profile) {
    return (
      <LinearGradient
        colors={["#F8F9FA", "#FFFFFF"]}
        style={styles.emptyContainer}
      >
        <Image
          source={require("../../../assets/avatar.png")}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>أنت غير مسجل الدخول</Text>
        <Text style={styles.emptySubText}>
          قم بإنشاء حساب جديد للاستفادة من كل المميزات
        </Text>
        <Button
          mode="contained"
          icon="account-plus"
          onPress={() => navigation.navigate("Register")}
          style={styles.registerButton}
          labelStyle={styles.buttonLabel}
        >
          إنشاء حساب جديد
        </Button>
      </LinearGradient>
    );
  }

  const displayName =
    profile.displayFullName !== false && profile.fullName
      ? profile.fullName
      : profile.aliasName?.trim()
      ? profile.aliasName
      : profile.fullName ?? "—";

  return (
    <Animated.ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadProfile} />
      }
    >
      {/* Hero */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View />
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
              style={styles.editBtn}
              activeOpacity={0.9}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>تعديل</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* بطاقة الاسم */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage }
                : require("../../../assets/profile_placeholder.png")
            }
            style={styles.avatar}
          />
        </View>

        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.phoneStrong}>
          {profile.phone ? `${profile.phone}` : "—"}
        </Text>
      </View>

      {/* المحتوى */}
      <View style={styles.content}>
        {/* المحفظة */}
        <Text style={styles.sectionTitle}>المحفظة</Text>
        <View style={styles.disabledCard}>
          <LinearGradient
            colors={[COLORS.gray, COLORS.gray]}
            style={styles.walletCard}
          >
            <View>
              <Text style={styles.walletLabel}>الرصيد المتاح</Text>
              <Text style={styles.walletAmount}>
                {profile.wallet?.balance ?? 0} ريال
              </Text>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={22} color="#fff" />
            </View>
          </LinearGradient>
          <Text style={styles.comingSoonText}>قريباً - قيد التطوير</Text>
        </View>

        {/* إدارة العناوين */}
        <SectionButton
          icon="map"
          label="إدارة العناوين"
          onPress={() => navigation.navigate("DeliveryAddresses", {})}
        />

        {/* محفظتي */}
        <SectionButton
          icon="wallet"
          label="محفظتي"
          onPress={() => (navigation as any).navigate("WalletScreen")}
        />

        {/* التسديد والسداد */}
        <View style={styles.disabledSectionButton}>
          <Ionicons name="card" size={20} color={COLORS.gray} />
          <Text style={styles.disabledSectionButtonText} numberOfLines={1}>
            التسديد زالشحن
          </Text>
          <Text style={styles.comingSoonBadge}>قريباً</Text>
        </View>

        {/* الاشتراكات */}
        <SectionButton
          icon="ribbon"
          label="الاشتراكات"
          onPress={() => navigation.navigate("Subscriptions")}
        />

        {/* كيف تستخدم التطبيق */}
        <SectionButton
          icon="play-circle"
          label="كيف تستخدم التطبيق"
          onPress={() => navigation.navigate("HowToUse")}
        />

        {/* سياسة الخصوصية */}
        <SectionButton
          icon="document-text"
          label="سياسة الخصوصية"
          onPress={() => openExternal("https://bthwani.com/privacy")}
        />

        {/* تواصل معنا */}
        <SectionButton
          icon="chatbubbles"
          label="تواصل معنا"
          onPress={() => navigation.navigate("Support")}
        />

        {/* خروج */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            setProfile(null); // امسح الكاش المحلي للشاشة
            // إن لم يكن لديك تبديل تلقائي بين ستاكات الضيوف/المسجّلين:
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }}
        >
          <Ionicons name="log-out" size={22} color={COLORS.primary} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
        {/* حذف الحساب */}
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={openDeleteDialog}
          activeOpacity={0.9}
        >
          <Ionicons name="trash" size={20} color="#d22" />
          <Text style={styles.deleteText}>حذف الحساب نهائيًا</Text>
          <Ionicons name="chevron-back" size={18} color="#f0b6b6" />
        </TouchableOpacity>

        <Modal
          visible={deleteOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Ionicons name="trash" size={20} color="#d22" />
                <Text style={styles.modalTitle}>حذف الحساب نهائيًا</Text>
              </View>

              {eligLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 12 }}>
                  <Text style={styles.modalHint}>
                    جارٍ التحقق من إمكانية الحذف…
                  </Text>
                </View>
              ) : (
                <>
                  {!eligibility?.canDelete && (
                    <View style={styles.blockBox}>
                      {(eligibility?.reasons || []).map((r, i) => (
                        <Text key={i} style={styles.blockText}>
                          • {r}
                        </Text>
                      ))}
                      <Text style={[styles.blockText, { marginTop: 6 }]}>
                        بعد حل هذه الأمور سيُتاح الحذف.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.modalLabel}>سبب الحذف (اختياري)</Text>
                  <TextInput
                    value={deleteReason}
                    onChangeText={setDeleteReason}
                    placeholder="اكتب سببك باختصار"
                    style={styles.modalInput}
                  />

                  <Text style={styles.modalLabel}>
                    للتأكيد اكتب كلمة{" "}
                    <Text style={{ fontFamily: "Cairo-Bold", color: "#d22" }}>
                      حذف
                    </Text>
                    :
                  </Text>
                  <TextInput
                    value={confirmText}
                    onChangeText={setConfirmText}
                    placeholder="حذف"
                    autoCapitalize="none"
                    style={styles.modalInput}
                  />

                  <View
                    style={{
                      flexDirection: "row-reverse",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.btnDanger,
                        { flex: 1, opacity: eligibility?.canDelete ? 1 : 0.4 },
                      ]}
                      onPress={onConfirmDelete}
                      disabled={!eligibility?.canDelete || deleteBusy}
                    >
                      {deleteBusy ? (
                        <Text style={styles.btnDangerText}>جارٍ الحذف…</Text>
                      ) : (
                        <Text style={styles.btnDangerText}>تأكيد الحذف</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnGhostBorder, { flex: 1 }]}
                      onPress={() => setDeleteOpen(false)}
                    >
                      <Text style={styles.btnGhostText}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalNote}>
                    سيتم إزالة بياناتك الشخصية من أنظمتنا. قد نحتفظ بسجلات غير
                    شخصية لأغراض قانونية (مثل السجلات المالية).
                  </Text>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroWrap: { paddingBottom: 64 },
  hero: {
    height: 140,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: SP,
    paddingTop: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  deleteRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: R,
    marginBottom: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F7D8D8",
    elevation: 1,
  },
  deleteText: {
    flex: 1,
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: "#d22",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  modalTitle: { fontFamily: "Cairo-Bold", fontSize: 15, color: COLORS.blue },
  modalHint: { fontFamily: "Cairo-Regular", fontSize: 12, color: "#666" },

  modalLabel: {
    fontFamily: "Cairo-Bold",
    fontSize: 12,
    color: COLORS.blue,
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "rgba(10,47,92,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "#222",
    backgroundColor: "#fff",
  },

  btnDanger: {
    backgroundColor: "#d22",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDangerText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 14 },

  btnGhostBorder: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  blockBox: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#f3c5c5",
    borderRadius: 12,
    padding: 10,
  },
  blockText: { color: "#a33", fontFamily: "Cairo-Regular", fontSize: 12 },

  modalNote: {
    color: "#666",
    fontFamily: "Cairo-Regular",
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  btnGhostText: {
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    fontSize: 14,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBtnText: { color: "#fff", fontFamily: "Cairo-SemiBold", fontSize: 12 },

  headerCard: {
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 54,
    paddingHorizontal: SP,
    paddingBottom: SP,
    marginTop: -74,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    alignItems: "center",
  },
  avatarWrap: {
    position: "absolute",
    top: -36,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  avatar: { width: "100%", height: "100%", resizeMode: "contain" },
  displayName: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    letterSpacing: 0.2,
    color: COLORS.blue,
    textAlign: "center",
  },
  phoneStrong: {
    marginTop: 4,
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
    color: "#6C7A89",
  },

  content: { paddingHorizontal: SP, paddingTop: SP },
  sectionTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.blue,
    marginBottom: 10,
  },

  walletCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SP,
    borderRadius: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  walletLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 2,
  },
  walletAmount: { fontFamily: "Cairo-Bold", fontSize: 22, color: "#FFF" },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletHint: {
    textAlign: "center",
    color: COLORS.primary,
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  disabledCard: {
    opacity: 0.6,
  },
  comingSoonText: {
    textAlign: "center",
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  disabledSectionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: R,
    marginBottom: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e9ecef",
    opacity: 0.6,
  },
  disabledSectionButtonText: {
    flex: 1,
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: COLORS.gray,
  },
  comingSoonBadge: {
    backgroundColor: COLORS.gray,
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  sectionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: R,
    marginBottom: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ECEFF4",
    elevation: 1,
  },
  sectionButtonText: {
    flex: 1,
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: COLORS.blue,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 14,
  },
  logoutText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: 8,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyImage: { width: 150, height: 150, marginBottom: 20 },
  emptyText: {
    fontFamily: "Cairo-Bold",
    fontSize: 20,
    color: "#333",
    marginBottom: 8,
  },
  emptySubText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  registerButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
  buttonLabel: { fontFamily: "Cairo-SemiBold", fontSize: 16 },
});
