import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import { Svg, Path, G, Rect, Circle, Line, Polyline } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import COLORS from "../../constants/colors";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول";
      Alert.alert("فشل الدخول", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, login]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <BrandLogo />
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.brandTitle}>مسوق</Text>
            <Text style={styles.brandSubtitle}>لوحة تحكم المسوق الميداني</Text>
            <Text style={styles.brandDescription}>
              تسجيل دخول آمن وسريع لإدارة مهامك الميدانية
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>مرحباً بك</Text>
              <Text style={styles.cardSubtitle}>سجل دخولك للمتابعة</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <View
                style={[styles.inputWrapper, errors.email && styles.inputError]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="أدخل بريدك الإلكتروني"
                  placeholderTextColor={COLORS.lightText}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                />
                <View style={styles.inputIcon}>
                  <EmailIcon />
                </View>
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={COLORS.lightText}
                  secureTextEntry={!visible}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                />
                <Pressable
                  onPress={() => setVisible(!visible)}
                  style={styles.eyeButton}
                >
                  <EyeIcon visible={visible} />
                </Pressable>
                <View style={styles.inputIcon}>
                  <LockIcon />
                </View>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberMe}>
                <View style={styles.checkbox}>
                  <View style={styles.checkmark} />
                </View>
                <Text style={styles.rememberText}>تذكرني</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  loading
                    ? [COLORS.lightGray, COLORS.textLight]
                    : [COLORS.primary, COLORS.secondary]
                }
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ---------- مكونات الأيقونات ----------
function BrandLogo() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Rect x="0" y="0" width="80" height="80" rx="20" fill={COLORS.white} />
      <G>
        <Path
          d="M25 50 L35 30 L45 40 L55 25"
          stroke={COLORS.primary}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="25" cy="50" r="3" fill={COLORS.primary} />
        <Circle cx="35" cy="30" r="3" fill={COLORS.primary} />
        <Circle cx="45" cy="40" r="3" fill={COLORS.primary} />
        <Circle cx="55" cy="25" r="3" fill={COLORS.primary} />
      </G>
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={COLORS.lightText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="12"
            cy="12"
            r="3"
            stroke={COLORS.lightText}
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            stroke={COLORS.lightText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line
            x1="1"
            y1="1"
            x2="23"
            y2="23"
            stroke={COLORS.lightText}
            strokeWidth={2}
          />
        </>
      )}
    </Svg>
  );
}

function EmailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke={COLORS.lightText}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="22,6 12,13 2,6"
        stroke={COLORS.lightText}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        stroke={COLORS.lightText}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke={COLORS.lightText}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke={COLORS.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DemoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 12l2 2 4-4"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3z"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3z"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3z"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3z"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------- الأنماط ----------
const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  logoGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontFamily: "Cairo_700Bold",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 18,
    fontFamily: "Cairo_600SemiBold",
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 4,
    textAlign: "center",
  },
  brandDescription: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 24,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    color: COLORS.blue,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.blue,
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 45,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    color: COLORS.error,
    marginTop: 4,
  },

  // Options Row
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  rememberText: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.primary,
  },

  // Login Button
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.white,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: COLORS.lightText,
  },

  // Alternative Options
  alternativeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  alternativeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  demoButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  alternativeButtonText: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.white,
    marginLeft: 8,
  },
  demoButtonText: {
    color: COLORS.primary,
  },

  // Sign Up
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.primary,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  copyright: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});
