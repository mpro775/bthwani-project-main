import React, { useState } from "react";
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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { requestPasswordReset } from "@/api/passwordResetApi";

import COLORS from "@/constants/colors";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSend = async () => {
    const em = email.trim().toLowerCase();
    if (!em || !isValidEmail(em)) {
      Alert.alert("خطأ", "أدخل بريدًا إلكترونيًا صحيحًا");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(em);
      Alert.alert(
        "تم الإرسال 📧",
        "أرسلنا رمز التحقق إلى بريدك (تحقق من البريد غير المرغوب فيه).",
        [
          {
            text: "متابعة",
            onPress: () => navigation.navigate("ResetVerify", { email: em }),
          },
        ]
      );
    } catch (e: any) {
      const code =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.code;

      const map: Record<string, string> = {
        EMAIL_NOT_FOUND: "هذا البريد غير مسجل.",
        NO_PASSWORD_PROVIDER:
          "الحساب مسجّل عبر Google ولا يملك كلمة مرور. ادخل بـ Google ثم أضف كلمة مرور من الإعدادات.",
        EMAIL_SEND_FAILED:
          "تعذر إرسال البريد من الخادم (SMTP). يرجى المحاولة لاحقًا.",
        FAILED_TO_SEND:
          "تعذر إرسال البريد (SMTP). تأكّد من إعدادات البريد على الخادم.",
      };
      Alert.alert("فشل الإرسال", map[code] || "تعذر إرسال الكود. حاول لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="always"
      >
        <View style={s.header}>
          <View style={s.iconCircle}>
            <Ionicons
              name="lock-closed-outline"
              size={36}
              color={COLORS.primary}
            />
          </View>
          <Text style={s.title}>استعادة كلمة المرور</Text>
          <Text style={s.sub}>أدخل بريدك لإرسال رمز التحقق</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>البريد الإلكتروني</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#999"
              style={{ marginLeft: 12 }}
            />
            <TextInput
              style={[s.input, s.ltrInput]}
              placeholder="example@mail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, (!email || !isValidEmail(email)) && s.btnDisabled]}
            onPress={handleSend}
            disabled={loading || !email || !isValidEmail(email)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>إرسال الرمز</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.link}>العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { flexGrow: 1, padding: 24, justifyContent: "center" },
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
    fontSize: 24,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
    marginBottom: 6,
  },
  sub: { color: "#666", fontFamily: "Cairo-Regular" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  label: { color: COLORS.blue, marginBottom: 8, fontFamily: "Cairo-Bold" },
  inputWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.blue, textAlign: "right" },
  ltrInput: { textAlign: "left", writingDirection: "ltr" },
  btn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,

    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Cairo-Bold" },
  link: {
    textAlign: "center",
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    marginTop: 16,
    textDecorationLine: "underline",
  },
});
