// app/(driver)/profile.tsx
import { getProfile, updateProfile } from "@/api/profile";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

interface ProfileData {
  fullName: string;
  email: string;
  vehicleType: string;
  vehicleClass?: string;
  vehiclePower?: number;
  phoneNumber?: string;
  rating?: number;
  totalTrips?: number;
  profileComplete?: boolean;
  missingRequired?: string[];
  docsApproved?: number;
}

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    vehicleType: "",
    vehicleClass: "",
    vehiclePower: 0,
    phoneNumber: "",
    rating: 0,
    totalTrips: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData({
        fullName: data.fullName || "",
        email: data.email || "",
        vehicleType: data.vehicleType || "",
        vehicleClass: data.vehicleClass || "",
        vehiclePower: data.vehiclePower || 0,
        phoneNumber: data.phoneNumber || "",
        rating: data.rating || 0,
        totalTrips: data.totalTrips || 0,
        profileComplete: data.profileComplete,
        missingRequired: data.missingRequired,
        docsApproved: data.docsApproved,
      });
    } catch (error) {
      console.error("❌ خطأ في تحميل البيانات:", error);
      Alert.alert("خطأ", "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        vehicleType: profileData.vehicleType,
      });
      Alert.alert("✅ تم الحفظ", "تم تحديث المعلومات بنجاح");
    } catch (error) {
      console.error("❌ خطأ في حفظ البيانات:", error);
      Alert.alert("❌ خطأ", "فشل في تحديث المعلومات");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ تحذير هام",
      "هل أنت متأكد من رغبتك في حذف حسابك؟\n\nسيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع عن هذا الإجراء.",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف الحساب",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "🛑 تأكيد الحذف",
      "اكتب 'حذف حسابي' لتأكيد الحذف:",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "تأكيد الحذف",
          style: "destructive",
          onPress: () => {
            // محاكاة حذف الحساب - يمكن استبدالها بدالة API حقيقية
            Alert.alert("✅ تم الحذف", "تم حذف حسابك بنجاح");
            // يمكن إضافة تسجيل الخروج هنا
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل البيانات...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{profileData.fullName || "الاسم"}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {(profileData.rating || 0).toFixed(1)} ({profileData.totalTrips || 0} طلب)
          </Text>
        </View>

        {/* مؤشر إكمال الحساب */}
        <View style={styles.completionContainer}>
          {profileData.profileComplete ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.completedText}>الحساب مكتمل ✅</Text>
            </View>
          ) : (
            <View style={styles.incompleteContainer}>
              <Ionicons name="warning" size={20} color={COLORS.orangeDark} />
              <Text style={styles.incompleteTitle}>الحساب غير مكتمل</Text>
              <Text style={styles.incompleteText}>
                العناصر الناقصة: {profileData.missingRequired?.join(", ") || "تحقق من البيانات"}
              </Text>
              <Text style={styles.docsText}>
                المستندات المعتمدة: {profileData.docsApproved || 0}/2
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="car" size={24} color={COLORS.primary} />
          <Text style={styles.statLabel}>نوع المركبة</Text>
          <Text style={styles.statValue}>
            {profileData.vehicleType || "غير محدد"}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="call" size={24} color={COLORS.success} />
          <Text style={styles.statLabel}>رقم الهاتف</Text>
          <Text style={styles.statValue}>
            {profileData.phoneNumber || "غير محدد"}
          </Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={profileData.fullName}
            onChangeText={(value) => updateProfileField("fullName", value)}
            placeholder="الاسم الكامل"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={profileData.email}
            onChangeText={(value) => updateProfileField("email", value)}
            placeholder="البريد الإلكتروني"
            keyboardType="email-address"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="car" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={profileData.vehicleType}
            onChangeText={(value) => updateProfileField("vehicleType", value)}
            placeholder="نوع المركبة (دراجة / سيارة)"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="build" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={profileData.vehicleClass}
            onChangeText={(value) => updateProfileField("vehicleClass", value)}
            placeholder="تصنيف المركبة (خفيف / متوسط / ثقيل)"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="speedometer" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={profileData.vehiclePower?.toString() || ""}
            onChangeText={(value) => updateProfileField("vehiclePower", value)}
            placeholder="قوة المركبة (cc أو kW)"
            keyboardType="numeric"
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>حفظ التعديلات</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>تحديث البيانات</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerContainer}>
        <Text style={styles.dangerTitle}>منطقة الخطر</Text>
        <Text style={styles.dangerText}>
          هذه الإجراءات لا يمكن التراجع عنها
        </Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>حذف الحساب</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Cairo-Regular",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Cairo-Regular",
    textAlign: "right",
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  dangerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dangerTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.danger,
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  // أنماط مؤشر الإكمال الجديدة
  completionContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  completedText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.success,
    marginLeft: 8,
  },
  incompleteContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.orangeDark,
    alignItems: "center",
  },
  incompleteTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.orangeDark,
    marginTop: 4,
    marginBottom: 8,
  },
  incompleteText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  docsText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
});
