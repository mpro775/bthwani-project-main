// app/(driver)/change-password.tsx
import { changePassword } from "@/api/profile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    // يجب أن تكون كلمة المرور 6 أحرف على الأقل
    if (password.length < 6) {
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    return null;
  };

  const handleSubmit = async () => {
    // التحقق من الحقول
    if (!oldPassword.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور القديمة");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    // التحقق من صحة كلمة المرور الجديدة
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert("خطأ", passwordError);
      return;
    }

    // التحقق من تطابق كلمة المرور
    if (newPassword !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return;
    }

    // التحقق من أن كلمة المرور الجديدة مختلفة عن القديمة
    if (oldPassword === newPassword) {
      Alert.alert("خطأ", "كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة");
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert(
        "✅ نجح",
        "تم تغيير كلمة المرور بنجاح",
        [
          {
            text: "حسناً",
            onPress: () => {
              // مسح الحقول
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              // العودة للصفحة السابقة
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ خطأ في تغيير كلمة المرور:", error);
      
      // معالجة أخطاء محددة
      const errorMessage = error?.response?.data?.userMessage 
        || error?.response?.data?.message 
        || "فشل في تغيير كلمة المرور. يرجى التحقق من كلمة المرور القديمة والمحاولة مرة أخرى.";
      
      Alert.alert("❌ خطأ", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
        <Text style={styles.title}>تغيير كلمة المرور</Text>
        <Text style={styles.subtitle}>
          قم بإدخال كلمة المرور القديمة والجديدة
        </Text>
      </View>

      {/* Security Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>نصائح الأمان:</Text>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>استخدم 6 أحرف على الأقل</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>امزج بين الأحرف والأرقام</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.tipText}>تجنب استخدام كلمات سهلة التخمين</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Old Password */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="كلمة المرور القديمة"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showOldPassword}
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowOldPassword(!showOldPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showOldPassword ? "eye" : "eye-off"}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="key" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="كلمة المرور الجديدة"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showNewPassword}
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? "eye" : "eye-off"}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>
          {newPassword.length > 0 && (
            <View style={styles.strengthIndicator}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: newPassword.length < 6 ? "33%" : newPassword.length < 10 ? "66%" : "100%",
                    backgroundColor: newPassword.length < 6 ? COLORS.danger : newPassword.length < 10 ? COLORS.orangeDark : COLORS.success,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="تأكيد كلمة المرور الجديدة"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons
                name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"}
                size={16}
                color={newPassword === confirmPassword ? COLORS.success : COLORS.danger}
              />
              <Text style={[
                styles.matchText,
                { color: newPassword === confirmPassword ? COLORS.success : COLORS.danger }
              ]}>
                {newPassword === confirmPassword ? "كلمات المرور متطابقة" : "كلمات المرور غير متطابقة"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>تغيير كلمة المرور</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelButtonText}>إلغاء</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color={COLORS.blue} />
        <Text style={styles.infoText}>
          سيتم تسجيل خروجك تلقائياً من جميع الأجهزة الأخرى بعد تغيير كلمة المرور
        </Text>
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
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
  },
  tipsContainer: {
    backgroundColor: COLORS.lightGray,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginLeft: 8,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
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
  eyeIcon: {
    padding: 8,
  },
  strengthIndicator: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    marginLeft: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  cancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});
