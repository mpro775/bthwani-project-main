import  { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import COLORS from "../../constants/colors";
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/routes";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.PROFILE_GET);
      setProfileData(res.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await api.patch(ENDPOINTS.PROFILE_UPDATE, profileData);
      Alert.alert('نجح', 'تم تحديث الملف الشخصي');
      setEditing(false);
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.userMessage || 'فشل التحديث');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      // طلب حذف (يلبي السياسة)
      await api.post("/auth/delete-account/request", {
        reason: "User initiated delete from app",
        contact: user.email || undefined,
      });
  
      // خيار: عرض رسالة بدلاً من تسجيل الخروج
      Alert.alert("تم الاستلام", "تم استلام طلب حذف الحساب وسنعالجه وفق السياسة.");
      setShowDeleteModal(false);
  
      // إن رغبت بالحذف الفوري:
      // await api.delete("/auth/delete-account");
      // await logout();
  
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "حدث خطأ أثناء حذف الحساب.");
    } finally {
      setIsDeleting(false);
    }
  };
  

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>حسابي</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "المستخدم"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>نظام الإحالة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>إعدادات الإشعارات</Text>
          </TouchableOpacity>



          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>المساعدة والدعم</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.dangerItem]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.dangerText}>طلب حذف الحساب</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تأكيد حذف الحساب</Text>
            <Text style={styles.modalMessage}>
              هل أنت متأكد من رغبتك في حذف حسابك؟ سيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? "جاري الحذف..." : "حذف الحساب"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    color: COLORS.blue,
    textAlign: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Cairo_700Bold",
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.blue,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 40,
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.white,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: "#ff4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 32,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Cairo_700Bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.text,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.white,
  },
});
