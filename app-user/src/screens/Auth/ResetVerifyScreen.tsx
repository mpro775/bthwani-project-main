import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { verifyResetCode, requestPasswordReset } from "@/api/passwordResetApi";

const COLORS = {
  primary: "#D84315",
  bg: "#FFFFFF",
  text: "#4E342E",
  border: "#E0E0E0",
};

export default function ResetVerifyScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const email = route.params?.email as string;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onChangeDigit = (v: string, idx: number) => {
    const n = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[idx] = n;
    setDigits(next);
    if (n && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      Alert.alert("خطأ", "أدخل رمزًا من 6 أرقام.");
      return;
    }
    setLoading(true);
    try {
      const { resetToken } = await verifyResetCode(email, code);
      navigation.replace("ResetNewPassword", { resetToken, email });
    } catch (e: any) {
      const code = e?.response?.data?.message || e?.code;
      const map: Record<string, string> = {
        INVALID_OR_EXPIRED_CODE: "الرمز غير صحيح أو منتهي.",
        EMAIL_NOT_FOUND: "البريد غير مسجل.",
      };
      Alert.alert("فشل التحقق", map[code] || "تحقق من الرمز وحاول مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(120);
    setDigits(["", "", "", "", "", ""]);
    try {
      await requestPasswordReset(email);
      Alert.alert("أرسلنا رمزًا جديدًا");
    } catch {
      Alert.alert("تعذّر إعادة الإرسال");
    }
  };

  const time = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
    timer % 60
  ).padStart(2, "0")}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.body}>
        <View style={s.header}>
          <View style={s.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={COLORS.primary} />
          </View>
          <Text style={s.title}>أدخل رمز التحقق</Text>
          <Text style={s.sub}>
            تم الإرسال إلى: <Text style={{ fontWeight: "700" }}>{email}</Text>
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  if (r) inputs.current[i] = r;
                }}
                style={[s.otpBox, d ? s.otpBoxFilled : null]}
                keyboardType="number-pad"
                value={d}
                onChangeText={(v) => onChangeDigit(v, i)}
                maxLength={1}
                textAlign="center"
                returnKeyType={i === 5 ? "done" : "next"}
                onSubmitEditing={i === 5 ? handleVerify : undefined}
              />
            ))}
          </View>

          <View style={s.timerRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={s.timerText}>
              {canResend
                ? "يمكنك إعادة الإرسال الآن"
                : `إعادة الإرسال خلال ${time}`}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
            style={[s.linkBtn, !canResend && { opacity: 0.5 }]}
          >
            <Text style={s.linkText}>إعادة إرسال الرمز</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, digits.some((x) => !x) && s.btnDisabled]}
            onPress={handleVerify}
            disabled={loading || digits.some((x) => !x)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>تحقق</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  sub: { color: "#666", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    fontSize: 20,
    fontWeight: "700",
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: "#FFF3E0" },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  timerText: { marginLeft: 6, color: "#666" },
  linkBtn: { alignSelf: "center", paddingVertical: 8 },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  btn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
