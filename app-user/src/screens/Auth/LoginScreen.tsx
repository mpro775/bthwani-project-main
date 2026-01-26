// src/screens/Auth/LoginScreen.tsx
import { loginWithEmail } from "@/api/authService";
import { useAuth } from "@/auth/AuthContext";
import { useCart } from "@/context/CartContext";
import { registerPushToken } from "@/notify";
import { saveUserProfile } from "@/storage/userStorage";
import axiosInstance from "@/utils/api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string; userId: string };
};

const COLORS = {
  primary: "#D84315",
  secondary: "#5D4037",
  background: "#FFFFFF",
  accent: "#8B4B47",
  text: "#4E342E",
  lightGray: "#F8F9FA",
  border: "#E0E0E0",
  success: "#4CAF50",
  error: "#F44336",
};

// دوال حماية المدخلات
const sanitizeInput = (text: string, maxLength: number = 100): string => {
  return text
    .replace(/[<>\"'&]/g, "") // إزالة الأحرف الخطيرة
    .replace(/\s+/g, " ") // تحويل المسافات المتعددة لمسافة واحدة
    .trim()
    .substring(0, maxLength);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 100;
};

const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    };
  }
  if (password.length > 128) {
    return { isValid: false, message: "كلمة المرور طويلة جداً" };
  }
  // منع الأحرف الخطيرة
  if (/[<>\"'&]/.test(password)) {
    return { isValid: false, message: "كلمة المرور تحتوي على أحرف غير مسموحة" };
  }
  return { isValid: true, message: "" };
};

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { mergeGuestCart } = useCart();
  const { login } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // دوال التعامل مع المدخلات المحمية
  const handleEmailChange = (text: string) => {
    const v = sanitizeInput(text, 100);
    setEmail(v);
    setEmailError(""); // 👈 لا تعرض خطأ أثناء الكتابة
  };

  const handlePasswordChange = (t: string) => {
    const v = t.substring(0, 128);
    setPassword(v);
    setPasswordError(""); // لا تعطي خطأ مباشرًا
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("يرجى إدخال البريد الإلكتروني");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("صيغة البريد الإلكتروني غير صحيحة");
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!password) {
      setPasswordError("يرجى إدخال كلمة المرور");
      isValid = false;
    } else if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      isValid = false;
    }

    if (!isValid) {
      shakeAnimation();
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const result = await loginWithEmail(email.trim().toLowerCase(), password);
      const token = result.idToken as string | undefined;
      const firebaseUid = result.localId as string | undefined;

      if (!token || !firebaseUid) {
        Alert.alert("خطأ", "لم يتم استلام البيانات بشكل صحيح");
        return;
      }

      // ✅ مزامنة ملف المستخدم على السيرفر (idempotent)
      const headers = { Authorization: `Bearer ${token}` };
      try {
        await axiosInstance.post(
          `/users/init`,
          {},
          { headers, timeout: 10000 }
        );
      } catch (e: any) {
        console.warn(
          "users/init failed (will continue):",
          e?.response?.status,
          e?.response?.data
        );
      }

      // اجلب الملف لمعرفة حالة التفعيل واحصل على Mongo _id
      let me: any | undefined;
      try {
        const meRes = await axiosInstance.get(`/users/me`, {
          headers,
          timeout: 10000,
        });
        me = meRes.data;
      } catch (e: any) {
        console.warn(
          "users/me failed:",
          e?.response?.status,
          e?.response?.data
        );
      }

      // خزّن userId بشكل موحّد (الأولوية لـ Mongo _id)
      const mongoId = me?._id ? String(me._id) : null;
      await AsyncStorage.multiSet([
        ["userId", mongoId ?? firebaseUid],
        ["firebaseUID", firebaseUid],
      ]);

      // لو غير مفعّل ابعت OTP ووجّه إلى شاشة التحقق
      if (me && me.email && me.emailVerified === false) {
        try {
          await axiosInstance.post(
            `/users/otp/send`,
            {},
            { headers, timeout: 10000 }
          );
        } catch (e: any) {
          console.warn(
            "otp/send failed:",
            e?.response?.status,
            e?.response?.data
          );
        }
        Alert.alert("تأكيد البريد", "أرسلنا لك رمز التحقق.");
        navigation.replace("OTPVerification", {
          email: me.email || email,
          userId: String(mongoId ?? firebaseUid),
        });
        return;
      }

      // 👇 عمليات ثانوية لا تُكسر الدخول لو فشلت
      try {
        await mergeGuestCart(mongoId ?? firebaseUid);
      } catch (e) {
        console.warn("mergeGuestCart failed", e);
      }
      try {
        await saveUserProfile({
          uid: firebaseUid,
          fullName: (result as any).displayName || "مستخدم",
          email: result.email || email,
          phone: (result as any).phone || "",
        });
      } catch (e) {
        console.warn("saveUserProfile failed", e);
      }
      try {
        await registerPushToken("user");
      } catch {}

      // فعّل الـ AuthContext لتحديث الهيدر وحالة التطبيق
      await login();

      Alert.alert("🎉 مرحبًا بك من جديد!", "تم تسجيل الدخول بنجاح.");
      navigation.replace("MainApp");
    } catch (error: any) {
      console.error("login failed =>", {
        status: error?.response?.status,
        data: error?.response?.data,
        code:
          error?.response?.data?.error?.message ||
          error?.code ||
          error?.message,
      });

      const code = error?.response?.data?.error?.message || error?.code;
      const map: Record<string, string> = {
        EMAIL_NOT_FOUND: "البريد الإلكتروني غير مسجل",
        INVALID_PASSWORD: "كلمة المرور غير صحيحة",
        INVALID_LOGIN_CREDENTIALS: "بيانات الدخول غير صحيحة",
        USER_DISABLED: "تم إيقاف هذا الحساب. تواصل مع الدعم.",
        TOO_MANY_ATTEMPTS_TRY_LATER: "محاولات كثيرة، حاول لاحقًا.",
      };

      const msg = map[code] || "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.";
      setErrorMessage(msg);
      Alert.alert("خطأ في تسجيل الدخول", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="storefront-outline"
                size={40}
                color={COLORS.primary}
              />
            </View>
          </View>
          <Text style={styles.welcomeTitle}>مرحباً بك مجدداً</Text>
          <Text style={styles.welcomeSubtitle}>سجل دخولك للمتابعة</Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "email" && styles.inputContainerFocused,
                emailError && styles.inputContainerError,
                email && !emailError && styles.inputContainerValid,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={
                  emailError
                    ? COLORS.error
                    : email && !emailError
                    ? COLORS.success
                    : focusedInput === "email"
                    ? COLORS.primary
                    : "#999"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.ltrInput]} // 👈
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="email" // 👈 RN 0.71+
                value={email}
                onChangeText={handleEmailChange}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => {
                  setFocusedInput(null);
                  if (email && !validateEmail(email))
                    setEmailError("صيغة البريد الإلكتروني غير صحيحة");
                }}
                editable={!loading}
                maxLength={100}
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>كلمة المرور</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "password" && styles.inputContainerFocused,
                passwordError && styles.inputContainerError,
                password && !passwordError && styles.inputContainerValid,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  passwordError
                    ? COLORS.error
                    : password && !passwordError
                    ? COLORS.success
                    : focusedInput === "password"
                    ? COLORS.primary
                    : "#999"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.ltrInput]} // 👈
                placeholder="أدخل كلمة المرور"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={handlePasswordChange}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => {
                  const validation = validatePassword(password);
                  if (!validation.isValid && password.length > 0) {
                    setPasswordError(validation.message);
                  }
                }}
                editable={!loading}
                maxLength={128}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonLoading,
                (!email || !password || emailError || passwordError) &&
                  styles.loginButtonDisabled,
              ]}
              onPress={() => {
                if (!validateForm()) {
                  shakeAnimation();
                  return;
                }
                handleLogin();
              }}
              disabled={
                loading ||
                !email ||
                !password ||
                Boolean(email && !validateEmail(email)) ||
                Boolean(password && !validatePassword(password).isValid)
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Cairo-Bold",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  ltrInput: {},
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF3E0",
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: "#FFEBEE",
  },
  inputContainerValid: {
    borderColor: COLORS.success,
    backgroundColor: "#F1F8E9",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    textAlign: "right",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: "right",
    marginTop: 4,
    fontWeight: "500",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
