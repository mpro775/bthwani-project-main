import { getStoredJwtToken, sendOtp, verifyEmailOtp } from "@/api/authService";
import { IntentManager } from "@/context/intent";
import { useVerificationState } from "@/context/verify";
import axiosInstance from "@/utils/api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function OTPVerificationScreen() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const { refresh, setVerified } = useVerificationState(); // استخدمه في الشاشة

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const { email, userId } = route.params || {};
  const handleSendOtp = async () => {
    try {
      await sendOtp();
      Alert.alert("تم الإرسال", "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.");
      setCode(["", "", "", "", "", ""]);
      setTimer(120);
      setCanResend(false);
      setTimeout(() => inputRefs.current[5]?.focus(), 100);
    } catch (e: any) {
      console.error("❌ sendOtp error:", e);
      const errorMsg = e?.message || "تعذر إرسال الرمز. حاول لاحقًا.";
      Alert.alert("خطأ", errorMsg);
    }
  };

  // عند أول فتح للشاشة:
  const sentRef = useRef(false);

  // عند أول فتح للشاشة:
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    handleSendOtp(); // لن تُستدعى إلا مرة واحدة حتى لو رُكّبت الشاشة مرتين
  }, []);
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
    ]).start(() => {
      // Auto-focus last input (leftmost in RTL) after animation completes
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 100);
    });
  }, []);

  // Timer countdown - يعيد التشغيل تلقائياً عند تغيير timer أو canResend
  useEffect(() => {
    if (timer <= 0 || canResend) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, canResend]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCodeChange = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    // Auto-focus previous input (left direction in RTL) if value is entered
    if (numericValue && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 50);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      const newCode = [...code];
      if (newCode[index]) {
        // If current field has value, clear it
        newCode[index] = "";
        setCode(newCode);
      } else if (index < 5) {
        // If current field is empty, move to next field (right direction in RTL) and clear it
        newCode[index + 1] = "";
        setCode(newCode);
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 50);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focusing for easier editing
    setTimeout(() => {
      inputRefs.current[index]?.setSelection(0, 1);
    }, 50);
  };

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

  const handleVerify = async () => {
    const otpCode = [...code].reverse().join("");
    if (!otpCode || otpCode.length !== 6) {
      shakeAnimation();
      Alert.alert(
        "بيانات ناقصة",
        "يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmailOtp(otpCode);

      if (result.success && result.verified) {
        Alert.alert("🎉 تم التحقق", "تم تأكيد بريدك الإلكتروني بنجاح.");
        setVerified(true); // يوقف المودال فورًا
        await IntentManager.runIfAny();

        await refresh(); // يضمن تزامنها مع /users/me
        navigation.replace("MainApp");
      } else {
        shakeAnimation();
        Alert.alert("❌ خطأ", "رمز التحقق غير صالح أو منتهي.");
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 400
          ? e?.message || "رمز التحقق غير صحيح أو منتهي."
          : status === 401
          ? "جلسة منتهية. سجّل دخولك ثم أعد المحاولة."
          : status === 404
          ? "المستخدم غير موجود."
          : e?.message || "حدث خطأ أثناء محاولة التحقق.";
      console.error("❌ Verify OTP Error:", e);
      shakeAnimation();
      Alert.alert("فشل التحقق", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await handleSendOtp();
    } catch (e) {
      console.error("❌ Resend OTP error:", e);
      Alert.alert("خطأ", "تعذر إرسال الرمز. حاول لاحقًا.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />

      <LinearGradient
        colors={["#D84315", "#FF5722", "#FF7043"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="mail-outline" size={40} color="#D84315" />
            </View>
          </View>

          <Text style={styles.title}>تحقق من بريدك الإلكتروني</Text>
          <Text style={styles.subtitle}>
            أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </Animated.View>

        {/* OTP Input Section */}
        <Animated.View
          style={[
            styles.otpContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <View style={styles.otpInputContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                onFocus={() => handleFocus(index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoFocus={index === 5}
              />
            ))}
          </View>

          {/* Timer Section */}
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.timerText}>
              {timer > 0
                ? `إعادة الإرسال خلال ${formatTime(timer)}`
                : "يمكنك إعادة الإرسال الآن"}
            </Text>
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              !canResend && styles.resendButtonDisabled,
            ]}
            onPress={handleResendOTP}
            disabled={!canResend}
          >
            <Text
              style={[
                styles.resendButtonText,
                !canResend && styles.resendButtonTextDisabled,
              ]}
            >
              إعادة إرسال الرمز
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Verify Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.verifyButton,
              loading && styles.verifyButtonLoading,
              code.every((digit) => digit !== "") && styles.verifyButtonActive,
            ]}
            onPress={handleVerify}
            disabled={loading || code.some((digit) => digit === "")}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>تحقق الآن</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Help Section */}
        <Animated.View style={[styles.helpContainer, { opacity: fadeAnim }]}>
          <Text style={styles.helpText}>لم تستلم الرمز؟</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "مساعدة",
                "تأكد من صندوق البريد الوارد والرسائل غير المرغوب فيها. إذا لم تستلم الرمز، تحقق من صحة عنوان بريدك الإلكتروني."
              )
            }
          >
            <Text style={styles.helpLink}>تحتاج مساعدة؟</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Cairo-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Cairo-Regular",
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  otpContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: (width - 120) / 6,
    height: 56,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#F8F9FA",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  otpInputFilled: {
    borderColor: "#D84315",
    backgroundColor: "#FFF3E0",
    shadowColor: "#D84315",
    shadowOpacity: 0.2,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
    fontFamily: "Cairo-Regular",
  },
  resendButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#D84315",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: "Cairo-Regular",
  },
  resendButtonTextDisabled: {
    color: "#999",
    fontFamily: "Cairo-Regular",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    fontFamily: "Cairo-Regular",
  },
  verifyButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    fontFamily: "Cairo-Regular",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonLoading: {
    opacity: 0.7,
    fontFamily: "Cairo-Regular",
  },
  verifyButtonText: {
    fontSize: 18,
    color: "#D84315",
    marginRight: 8,
    fontFamily: "Cairo-Regular",
  },
  buttonIcon: {
    marginLeft: 4,
  },
  helpContainer: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  helpText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    fontFamily: "Cairo-Regular",
  },
  helpLink: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Cairo-Regular",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
