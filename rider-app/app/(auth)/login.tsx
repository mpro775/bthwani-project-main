// app/(auth)/login.tsx
import { loginDriver } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Cairo-Regular": require("../../assets/fonts/Cairo-Regular.ttf"),
    "Cairo-Bold": require("../../assets/fonts/Cairo-Bold.ttf"),
  });
  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { token, driver } = await loginDriver({ phone, password });
      await signIn(token, driver);
    } catch (error: any) {
      Alert.alert("فشل الدخول", error?.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.lightGray, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
           
            <Text style={styles.appName}>تطبيق الكابتن</Text>
            <Text style={styles.subtitle}>مرحباً بك في عالم بثواني</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>تسجيل الدخول</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  placeholder="أدخل رقم الهاتف"
                  placeholderTextColor="rgba(137, 137, 137, 0.6)"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor="rgba(137, 137, 137, 0.6)"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? [COLORS.lightText, COLORS.gray] : [COLORS.primary, COLORS.orangeDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>دخول</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.background} style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.lightGray,
    opacity: 0.3,
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    top: height * 0.3,
    left: -75,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.orangeDark,
    opacity: 0.15,
    bottom: 100,
    right: -50,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    color: COLORS.background,
  },
  appName: {
    fontFamily: "Cairo-Bold",
    fontSize: 28,
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Cairo-Regular",
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  title: {
    fontFamily: "Cairo-Bold",
    fontSize: 24,
    color: COLORS.blue,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Cairo-Bold",
    fontSize: 14,
    textAlign: 'right',

    color: COLORS.blue,
    marginBottom: 8,
    marginRight: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightText,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Cairo-Regular",
    fontSize: 16,

    color: COLORS.dark,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontFamily: "Cairo-Bold",
    fontSize: 18,
    color: COLORS.background,
    marginRight: 8,
  },
  buttonIcon: {
    marginRight: 0,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  forgotPasswordText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
