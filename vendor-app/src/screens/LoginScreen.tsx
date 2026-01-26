// src/screens/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RootStackParamList } from "../AppNavigator";
import axios from "../api/axiosInstance";
import CustomInput from "../components/CustomInput";
import { COLORS } from "../constants/colors";
import { useUser } from "../hooks/userContext";
import { registerForPushNotificationsAsync } from "../utils/notifications";

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUser();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();

  // ارتفاع مرن للهيدر: لا يزيد عن 320px، ونسبة تقريبية من الشاشة
  const headerMinHeight = useMemo(() => {
    const ratio = height < 700 ? 0.32 : 0.35;
    return Math.min(height * ratio, 320);
  }, []);

  const validateForm = () => {
    if (!phone.trim() || !password.trim()) {
      setError("رقم الهاتف وكلمة المرور مطلوبة.");
      return false;
    }
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("الرجاء إدخال رقم هاتف صحيح.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleLogin = async () => {

    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await axios.post("/vendor/auth/vendor-login", {
        phone,
        password,
      });
      await AsyncStorage.setItem("token", res.data.token);
      setUser({
        ...res.data.vendor,
        token: res.data.token,
        storeId: res.data.vendor.store,
      });
      navigation.replace("Vendor");
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...res.data.vendor,
          token: res.data.token,
          storeId: res.data.vendor.store,
        })
      );
      setTimeout(async () => {
        const token = await registerForPushNotificationsAsync();
        if (token && res.data?.vendor?._id) {
          await axios.patch("/vendors/me", {
            expoPushToken: token,
          });
        }
      }, 300);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        "فشل تسجيل الدخول. يرجى المحاولة مرة رجاء.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Header Section */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary]}
            style={[
              styles.header,
              {
                minHeight: headerMinHeight,
                paddingTop: insets.top + 16,
              },
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="storefront" size={40} color="#FFF" />
                </View>
              </View>
              <Text style={styles.welcomeTitle}>مرحباً بك في</Text>
              <Text style={styles.appTitle}>تطبيق التاجر</Text>
              <Text style={styles.welcomeSubtitle}>
                سجل دخولك لإدارة متجرك بسهولة
              </Text>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={[styles.formContainer, { paddingBottom: 40 }]}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="log-in" size={24} color={COLORS.primary} />
                <Text style={styles.formTitle}>تسجيل الدخول</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Ionicons name="call" size={16} color="#666" />
                    <Text style={styles.label}>رقم الهاتف</Text>
                  </View>
                  <CustomInput
                    label=""
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="7xxxxxxxx"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Ionicons name="lock-closed" size={16} color="#666" />
                    <Text style={styles.label}>كلمة المرور</Text>
                  </View>
                  <CustomInput
                    label=""
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    secureTextEntry
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#F44336" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary]}
                    style={styles.loginButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="#FFF" />
                        <Text style={styles.loginButtonText}>
                          جاري تسجيل الدخول...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.loginButtonContent}>
                        <Ionicons name="log-in" size={20} color="#FFF" />
                        <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {}}
            >
              <Ionicons name="help-circle" size={16} color={COLORS.primary} />
              <Text style={styles.forgotPassword}>هل نسيت كلمة المرور؟</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    // أزلنا الارتفاع الثابت واستعضنا عنه بـ minHeight ديناميكي
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: { marginBottom: 20 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  welcomeTitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Cairo-Regular",
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 32,
    color: "#FFF",
    fontFamily: "Cairo-Bold",
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Cairo-Regular",
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20, // زيادة الـ padding للراحة
    paddingBottom: 24, // padding إضافي للأسفل
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: 22,
    color: COLORS.text,
    fontFamily: "Cairo-Bold",
    marginLeft: 10,
  },
  form: { width: "100%" },
  inputGroup: {},
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: "#F44336",
    fontFamily: "Cairo-Regular",
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    marginTop: 16, // زيادة المسافة من الأعلى
    marginBottom: 8, // إضافة مسافة من الأسفل
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginLeft: 10,
  },
  loginButtonDisabled: { opacity: 0.7 },
  forgotPasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24, // زيادة المسافة من الأعلى
    padding: 12, // زيادة الـ padding
    paddingBottom: 16, // padding إضافي للأسفل
  },
  forgotPassword: {
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
    marginLeft: 8,
    fontSize: 16,
  },
  demoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  demoText: {
    color: "#E65100",
    fontFamily: "Cairo-Regular",
    marginLeft: 8,
    fontSize: 14,
    textAlign: "center",
  },
});
