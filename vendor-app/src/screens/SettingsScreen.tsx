import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../api/axiosInstance";
import { COLORS } from "../constants/colors";
import { UserContext } from "../hooks/userContext";

interface NotificationSettings {
  enabled: boolean;
  orderAlerts: boolean;
  financialAlerts: boolean;
  marketingAlerts: boolean;
  systemUpdates: boolean;
}

const ACCOUNT_DELETION = {
  deletionWindowDays: 30,
  backupRetentionDays: 90,
  webDeletionUrl: "https://example.com/delete-account",
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { setUser } = useContext(UserContext);

  // حساب من الـ API
  const [accountInfo, setAccountInfo] = useState({
    merchantName: "",
    phoneNumber: "",
    email: "",
  });

  // تفضيلات الإشعارات من الـ API
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      enabled: true,
      orderAlerts: true,
      financialAlerts: true,
      marketingAlerts: false,
      systemUpdates: true,
    });

  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // حذف الحساب
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmWord, setConfirmWord] = useState(""); // اكتب: "حذف"
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [exportData, setExportData] = useState(false);
  const [deleting, setDeleting] = useState(false);

// useEffect داخل SettingsScreen
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      // 1) استخدم المسار الموجود فعلاً في الباك:
      const me = await axiosInstance.get("/vendors/me");

      if (mounted) {
        // 2) اقرأ الحقول الصحيحة كما يرجعها الباك
        setAccountInfo({
          merchantName: me.data?.fullName || "",
          phoneNumber: me.data?.phone || "",
          email: me.data?.email || "",
        });
      }

      // Get notification settings from vendor entity
      const prefs = me.data?.notificationSettings || {};
      if (mounted) {
        setNotificationSettings({
          enabled: prefs?.enabled ?? true,
          orderAlerts: prefs?.orderAlerts ?? true,
          financialAlerts: prefs?.financialAlerts ?? true,
          marketingAlerts: prefs?.marketingAlerts ?? false,
          systemUpdates: prefs?.systemUpdates ?? true,
        });
      }
    } catch (e: any) {
      Alert.alert("خطأ", e?.response?.data?.message || "تعذر تحميل الإعدادات");
    } finally {
      if (mounted) setLoadingPrefs(false);
    }
  })();
  return () => { mounted = false; };
}, []);


  const updatePrefs = async (next: NotificationSettings) => {
    try {
      setSavingPrefs(true);
      setNotificationSettings(next); // تحديث تفاؤلي
      await axiosInstance.patch("/vendors/me", {
        notificationSettings: next
      });
    } catch (e: any) {
      Alert.alert("خطأ", e?.response?.data?.message || "تعذر حفظ الإعدادات");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordChange = () => {
    Alert.alert(
      "تغيير كلمة المرور",
      "سيتم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إرسال",
          onPress: () => console.log("Password reset email sent"),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            setUser(null);
            // @ts-ignore
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  const openTermsAndConditions = () =>
    Linking.openURL("https://bthwina.com/terms");
  const openPrivacyPolicy = () =>
    Linking.openURL("https://bthwina.com/privacy");
  const openWebDeletion = () =>
    Linking.openURL(ACCOUNT_DELETION.webDeletionUrl);

  const submitAccountDeletion = async () => {
    if (!confirmChecked) {
      Alert.alert("تنبيه", "يرجى تأكيد فهمك لعدم إمكانية التراجع.");
      return;
    }
    if (confirmWord.trim() !== "حذف") {
      Alert.alert("تنبيه", "أدخل كلمة التأكيد الصحيحة: حذف");
      return;
    }

    try {
      setDeleting(true);
      await axiosInstance.post("/vendors/account/delete-request", {
        reason: deleteReason || null,
        exportData: !!exportData,
      });

      Alert.alert(
        "تم استلام الطلب",
        `سيُجدول حذف حسابك وبياناتك خلال ≤ ${ACCOUNT_DELETION.deletionWindowDays} يومًا. قد تُحتفظ بعض السجلات غير الشخصية لأغراض قانونية/محاسبية، وتُزال النسخ الاحتياطية خلال ≤ ${ACCOUNT_DELETION.backupRetentionDays} يومًا.`
      );

      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      setUser(null);
      setShowDeleteModal(false);
      setDeleteReason("");
      setConfirmWord("");
      setConfirmChecked(false);
      setExportData(false);
      // @ts-ignore
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error: any) {
      console.error(error?.response?.data || error?.message);
      Alert.alert(
        "خطأ",
        error?.response?.data?.message || "تعذر إرسال طلب الحذف."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <Text style={styles.headerSubtitle}>إدارة حسابك وتفضيلاتك</Text>
        </LinearGradient>

        {/* معلومات الحساب */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحساب</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>اسم التاجر:</Text>
              <Text style={styles.infoValue}>
                {loadingPrefs ? "..." : accountInfo.merchantName || "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>رقم الجوال:</Text>
              <Text style={styles.infoValue}>
                {loadingPrefs ? "..." : accountInfo.phoneNumber || "—"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
              <Text style={styles.infoValue}>
                {loadingPrefs ? "..." : accountInfo.email || "—"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePasswordChange}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.actionButtonText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>
        </View>

        {/* إعدادات الإشعارات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            إعدادات الإشعارات {savingPrefs ? "" : ""}
          </Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>تفعيل الإشعارات</Text>
              {loadingPrefs ? (
                <ActivityIndicator />
              ) : (
                <Switch
                  value={notificationSettings.enabled}
                  onValueChange={(value) =>
                    updatePrefs({ ...notificationSettings, enabled: value })
                  }
                  trackColor={{ false: "#767577", true: COLORS.primary }}
                  thumbColor={notificationSettings.enabled ? "#fff" : "#f4f3f4"}
                />
              )}
            </View>

            {notificationSettings.enabled && !loadingPrefs && (
              <>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>تنبيهات الطلبات</Text>
                  <Switch
                    value={notificationSettings.orderAlerts}
                    onValueChange={(value) =>
                      updatePrefs({
                        ...notificationSettings,
                        orderAlerts: value,
                      })
                    }
                    trackColor={{ false: "#767577", true: COLORS.primary }}
                    thumbColor={
                      notificationSettings.orderAlerts ? "#fff" : "#f4f3f4"
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>التنبيهات المالية</Text>
                  <Switch
                    value={notificationSettings.financialAlerts}
                    onValueChange={(value) =>
                      updatePrefs({
                        ...notificationSettings,
                        financialAlerts: value,
                      })
                    }
                    trackColor={{ false: "#767577", true: COLORS.primary }}
                    thumbColor={
                      notificationSettings.financialAlerts ? "#fff" : "#f4f3f4"
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>الإعلانات والعروض</Text>
                  <Switch
                    value={notificationSettings.marketingAlerts}
                    onValueChange={(value) =>
                      updatePrefs({
                        ...notificationSettings,
                        marketingAlerts: value,
                      })
                    }
                    trackColor={{ false: "#767577", true: COLORS.primary }}
                    thumbColor={
                      notificationSettings.marketingAlerts ? "#fff" : "#f4f3f4"
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>تحديثات النظام</Text>
                  <Switch
                    value={notificationSettings.systemUpdates}
                    onValueChange={(value) =>
                      updatePrefs({
                        ...notificationSettings,
                        systemUpdates: value,
                      })
                    }
                    trackColor={{ false: "#767577", true: COLORS.primary }}
                    thumbColor={
                      notificationSettings.systemUpdates ? "#fff" : "#f4f3f4"
                    }
                  />
                </View>
              </>
            )}

            {savingPrefs && (
              <View style={{ marginTop: 8, alignItems: "center" }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={{ color: "#6B7280", marginTop: 6 }}>
                  جاري الحفظ...
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* السياسات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>السياسات والقوانين</Text>
          <View style={styles.policiesCard}>
            <TouchableOpacity
              style={styles.policyButton}
              onPress={openTermsAndConditions}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.policyButtonText}>الشروط والأحكام</Text>
              <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.policyButton}
              onPress={openPrivacyPolicy}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.policyButtonText}>سياسة الخصوصية</Text>
              <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.policyButton}
              onPress={openWebDeletion}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
              <Text style={styles.policyButtonText}>حذف الحساب عبر الويب</Text>
              <Ionicons name="open-outline" size={20} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* خروج + حذف الحساب */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-bin" size={20} color="#fff" />
            <Text style={styles.deleteText}>حذف الحساب والبيانات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal حذف الحساب */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={22} color="#F44336" />
              <Text style={styles.modalTitle}>
                حذف الحساب — لا يمكن التراجع
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalNote}>
                سيؤدي ذلك إلى إغلاق حسابك وحذف بياناتك الشخصية من خوادمنا خلال ≤{" "}
                {ACCOUNT_DELETION.deletionWindowDays} يومًا. قد نحتفظ ببعض
                السجلات غير الشخصية لأغراض قانونية/محاسبية. تُزال النسخ
                الاحتياطية خلال ≤ {ACCOUNT_DELETION.backupRetentionDays} يومًا.
              </Text>

              <Text style={styles.inputLabel}>سبب الحذف (اختياري)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="اكتب سببًا (اختياري)"
                placeholderTextColor="#9CA3AF"
                value={deleteReason}
                onChangeText={setDeleteReason}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rowBetween}>
                <Text style={styles.settingLabel}>
                  طلب نسخة من بياناتي قبل الحذف
                </Text>
                <Switch
                  value={exportData}
                  onValueChange={setExportData}
                  trackColor={{ false: "#767577", true: COLORS.primary }}
                  thumbColor={exportData ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.confirmLine}>
                <View style={styles.checkbox}>
                  <TouchableOpacity
                    onPress={() => setConfirmChecked(!confirmChecked)}
                    style={[
                      styles.checkboxBox,
                      confirmChecked && styles.checkboxBoxOn,
                    ]}
                  >
                    {confirmChecked && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.confirmText}>
                  أؤكد أنني قرأت وفهمت أن الحذف نهائي ولا يمكن التراجع عنه.
                </Text>
              </View>

              <Text style={styles.inputLabel}>
                للتأكيد اكتب كلمة:{" "}
                <Text style={{ fontFamily: "Cairo-Bold" }}>حذف</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="اكتب: حذف"
                placeholderTextColor="#9CA3AF"
                value={confirmWord}
                onChangeText={setConfirmWord}
              />

              <TouchableOpacity
                style={styles.webDeletionLink}
                onPress={openWebDeletion}
              >
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.webDeletionText}>
                  لا تستطيع الدخول للتطبيق؟ احذف عبر الويب
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteBtn,
                  (!confirmChecked || confirmWord.trim() !== "حذف") && {
                    opacity: 0.5,
                  },
                ]}
                onPress={submitAccountDeletion}
                disabled={
                  deleting || !confirmChecked || confirmWord.trim() !== "حذف"
                }
              >
                <LinearGradient
                  colors={["#F44336", "#D32F2F"]}
                  style={styles.confirmDeleteGrad}
                >
                  {deleting ? (
                    <Text style={styles.confirmDeleteText}>جاري الإرسال…</Text>
                  ) : (
                    <Text style={styles.confirmDeleteText}>تأكيد الحذف</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, direction: "rtl" },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    color: "white",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Cairo-Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Cairo-Regular",
    textAlign: "center",
  },

  section: { marginVertical: 10, paddingHorizontal: 15 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 20,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputLabel: {},
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontFamily: "Cairo-Regular",
  },
  infoValue: { fontSize: 16, color: COLORS.text, fontFamily: "Cairo-SemiBold" },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    marginRight: 10,
  },

  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontFamily: "Cairo-Regular",
  },

  policiesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  policyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  policyButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Cairo-SemiBold",
    marginRight: 10,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginRight: 10,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D32F2F",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    elevation: 3,
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginRight: 10,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  modalBody: { paddingVertical: 6 },
  modalNote: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Cairo-Regular",
    marginBottom: 12,
    lineHeight: 22,
  },

  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Cairo-Regular",
    marginBottom: 10,
    textAlign: "right",
  },
  textArea: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Cairo-Regular",
    minHeight: 80,
    textAlignVertical: "top",
    textAlign: "right",
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },

  confirmLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: { marginRight: 8 },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxBoxOn: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  confirmText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontFamily: "Cairo-Regular",
  },

  webDeletionLink: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  webDeletionText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  cancelText: { fontFamily: "Cairo-Bold", color: "#111827" },

  confirmDeleteBtn: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  confirmDeleteGrad: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteText: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 16 },
});

export default SettingsScreen;
