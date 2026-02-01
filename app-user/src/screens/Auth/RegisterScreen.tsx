// src/screens/Auth/RegisterScreen.tsx
import {
  registerLocal,
  loginLocal,
  sendOtp,
} from "@/api/authService";
import { useAuth } from "@/auth/AuthContext";
import { registerPushToken } from "@/notify";
import axiosInstance from "@/utils/api/axiosInstance";
import { API_URL } from "@/utils/api/config";
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
  MainApp: undefined;
  Register: undefined;
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
    .replace(/[<>\"'&]/g, "") // إزالة الأحرف الخطيرة فقط
    .replace(/\s+/g, " ") // تحويل المسافات المتعددة لمسافة واحدة
    .trim()
    .substring(0, maxLength);
};

const sanitizeNameInput = (text: string, maxLength: number = 50): string => {
  // السماح بالمسافات والأحرف العربية والإنجليزية
  return text
    .replace(/[<>\"'&]/g, "") // إزالة الأحرف الخطيرة فقط
    .replace(/\s+/g, " ") // تحويل المسافات المتعددة لمسافة واحدة
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

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();

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
  const handleNameChange = (text: string) => {
    const v = sanitizeNameInput(text, 50);
    setName(v);
    setNameError("");
  };

  const handleEmailChange = (text: string) => {
    const v = sanitizeInput(text, 100);
    setEmail(v);
    setEmailError("");
  };

  const handlePhoneChange = (text: string) => {
    const v = sanitizeInput(text, 20);
    setPhone(v);
    setPhoneError("");
  };

  const handlePasswordChange = (text: string) => {
    const v = text.substring(0, 128);
    setPassword(v);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (text: string) => {
    const v = text.substring(0, 128);
    setConfirmPassword(v);
    setConfirmPasswordError("");
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("يرجى إدخال الاسم الكامل");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("يرجى إدخال البريد الإلكتروني");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("صيغة البريد الإلكتروني غير صحيحة");
      isValid = false;
    }

    if (!phone.trim()) {
      setPhoneError("يرجى إدخال رقم الهاتف");
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

    if (!confirmPassword) {
      setConfirmPasswordError("يرجى تأكيد كلمة المرور");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("كلمتا المرور غير متطابقتين");
      isValid = false;
    }

    if (!isValid) {
      shakeAnimation();
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");
    try {
      // 1) تسجيل حساب جديد
      const result = await registerLocal(
        email.trim(),
        password,
        name.trim(),
        phone.trim()
      );

      if (!result.success || !result.token) {
        throw new Error("فشل إنشاء الحساب");
      }

      // 2) تهيئة بيانات المستخدم (idempotent)
      try {
        await axiosInstance.post(
          `${API_URL}/users/init`,
          { fullName: name.trim(), email: email.trim(), phone: phone.trim() },
          {
            headers: { Authorization: `Bearer ${result.token}` },
            timeout: 10000,
          }
        );
      } catch (e: any) {
        // لا نرمي خطأ هنا، init idempotent
        console.warn("init user warning:", e?.response?.data);
      }

      // 3) إرسال OTP
      try {
        await sendOtp();
      } catch (e: any) {
        Alert.alert(
          "تنبيه",
          "تعذّر إرسال الرمز الآن، جرّب إعادة الإرسال من شاشة التحقق."
        );
      }

      // 4) استخدام userId من استجابة التسجيل مباشرة (تجنّب الاعتماد على /users/me بعد التسجيل)
      const userId = String(result.user?.id ?? result.user?._id ?? "");
      if (!userId) {
        throw new Error("لم يتم إرجاع معرّف المستخدم من الخادم");
      }

      try {
        await AsyncStorage.setItem("userId", userId);
      } catch {}

      navigation.navigate("OTPVerification", {
        email,
        userId,
        skipAutoSend: true,
      });
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code || err?.code || "";
      const status = err?.response?.status;

      // إذا كان البريد مسجل مسبقاً، حاول تسجيل الدخول
      if (errorCode === "EMAIL_ALREADY_EXISTS" || status === 409) {
        try {
          const loginData = await loginLocal(email.trim(), password);

          if (!loginData.success || !loginData.token) {
            throw new Error("فشل تسجيل الدخول");
          }

          // جلب المستخدم
          const userRes = await axiosInstance.get(`/users/me`, {
            headers: { Authorization: `Bearer ${loginData.token}` },
            timeout: 10000,
          });
          const user = userRes.data;

          if (!user.emailVerified) {
            // إرسال OTP للمستخدم الحالي
            try {
              await sendOtp();
            } catch (e: any) {
              console.error("❌ /users/otp/send (existing) failed", e);
            }

            // خزّن userId للمرحلة القادمة
            try {
              await AsyncStorage.setItem("userId", String(user._id || user.id));
            } catch {}

            Alert.alert("تأكيد البريد", "أرسلنا لك رمز التحقق.");
            navigation.navigate("OTPVerification", {
              email,
              userId: String(user._id || user.id),
              skipAutoSend: true,
            });
            return;
          }

          // المستخدم مفعّل ✅ -> ادخل التطبيق
          try {
            await AsyncStorage.setItem("userId", String(user._id || user.id));
          } catch {}

          try {
            await registerPushToken("user");
          } catch {}

          // فعّل حالة الأوث (يحدّث Authorization header عالميًا)
          await login();

          Alert.alert(
            "مرحبًا",
            `تم تسجيل دخولك يا ${name || user.fullName || "مستخدم"}`
          );
          navigation.replace("MainApp");
        } catch (e: any) {
          const loginError =
            e?.response?.data?.error?.userMessage ||
            e?.message ||
            "كلمة المرور غير صحيحة أو فشل تسجيل الدخول.";
          Alert.alert("خطأ", loginError);
        }
        return;
      }

      // أخطاء أخرى
      const msg =
        err?.response?.data?.error?.userMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "حدث خطأ غير متوقع أثناء إنشاء الحساب.";

      setErrorMessage(msg);
      Alert.alert("خطأ", msg);
      console.error("register error =>", { errorCode, status, msg, err });
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
                name="person-add-outline"
                size={40}
                color={COLORS.primary}
              />
            </View>
          </View>
          <Text style={styles.welcomeTitle}>إنشاء حساب جديد</Text>
          <Text style={styles.welcomeSubtitle}>انضم إلينا وابدأ رحلتك</Text>
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
          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>الاسم الكامل</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "name" && styles.inputContainerFocused,
                nameError && styles.inputContainerError,
                name && !nameError && styles.inputContainerValid,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  nameError
                    ? COLORS.error
                    : name && !nameError
                    ? COLORS.success
                    : focusedInput === "name"
                    ? COLORS.primary
                    : "#999"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={handleNameChange}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
                maxLength={50}
              />
            </View>
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

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
                style={[styles.input, styles.ltrInput]}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="email"
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

          {/* Phone Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "phone" && styles.inputContainerFocused,
                phoneError && styles.inputContainerError,
                phone && !phoneError && styles.inputContainerValid,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={
                  phoneError
                    ? COLORS.error
                    : phone && !phoneError
                    ? COLORS.success
                    : focusedInput === "phone"
                    ? COLORS.primary
                    : "#999"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.ltrInput]}
                placeholder="أدخل رقم هاتفك"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCorrect={false}
                value={phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
                maxLength={20}
              />
            </View>
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
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
                style={[styles.input, styles.ltrInput]}
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

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
            <View
              style={[
                styles.inputContainer,
                focusedInput === "confirmPassword" &&
                  styles.inputContainerFocused,
                confirmPasswordError && styles.inputContainerError,
                confirmPassword &&
                  !confirmPasswordError &&
                  styles.inputContainerValid,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  confirmPasswordError
                    ? COLORS.error
                    : confirmPassword && !confirmPasswordError
                    ? COLORS.success
                    : focusedInput === "confirmPassword"
                    ? COLORS.primary
                    : "#999"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.ltrInput]}
                placeholder="أعد إدخال كلمة المرور"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => {
                  if (confirmPassword && password !== confirmPassword) {
                    setConfirmPasswordError("كلمتا المرور غير متطابقتين");
                  }
                }}
                editable={!loading}
                maxLength={128}
              />

              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonLoading,
                (!name ||
                  !email ||
                  !phone ||
                  !password ||
                  !confirmPassword ||
                  nameError ||
                  emailError ||
                  phoneError ||
                  passwordError ||
                  confirmPasswordError) &&
                  styles.registerButtonDisabled,
              ]}
              onPress={() => {
                if (!validateForm()) {
                  shakeAnimation();
                  return;
                }
                handleRegister();
              }}
              disabled={
                loading ||
                !name ||
                !email ||
                !phone ||
                !password ||
                !confirmPassword ||
                Boolean(name && !name.trim()) ||
                Boolean(email && !validateEmail(email)) ||
                Boolean(phone && !phone.trim()) ||
                Boolean(password && !validatePassword(password).isValid) ||
                Boolean(confirmPassword && password !== confirmPassword)
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>إنشاء الحساب</Text>
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
          <Text style={styles.footerText}>هل لديك حساب؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>تسجيل الدخول</Text>
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
  registerButton: {
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
  registerButtonLoading: {
    opacity: 0.7,
  },
  registerButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
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

export default RegisterScreen;
