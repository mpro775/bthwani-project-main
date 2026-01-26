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
import { useRoute, useNavigation } from "@react-navigation/native";
import { resetPassword } from "@/api/passwordResetApi";

import COLORS from "@/constants/colors";

export default function ResetNewPasswordScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const resetToken = route.params?.resetToken as string;
  const email = route.params?.email as string;

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = p1.length >= 6 && p1.length <= 128 && p1 === p2;

  const handleSubmit = async () => {
    if (!valid) {
      Alert.alert("خطأ", "تحقق من كلمة المرور والتأكيد.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, p1);
      Alert.alert(
        "تم التغيير",
        "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
        [{ text: "دخول", onPress: () => navigation.replace("Login") }]
      );
    } catch (e: any) {
      const code = e?.response?.data?.message || e?.code;
      const map: Record<string, string> = {
        INVALID_OR_EXPIRED_TOKEN: "انتهت صلاحية الطلب. أعد العملية من جديد.",
        BAD_TOKEN: "طلب غير صالح.",
      };
      Alert.alert(
        "فشل العملية",
        map[code] || "تعذر تغيير كلمة المرور. حاول لاحقًا."
      );
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
            <Ionicons name="key-outline" size={36} color={COLORS.primary} />
          </View>
          <Text style={s.title}>تعيين كلمة مرور جديدة</Text>
          {!!email && <Text style={s.sub}>{email}</Text>}
        </View>

        <View style={s.card}>
          <Text style={s.label}>كلمة المرور الجديدة</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={{ marginLeft: 12 }}
            />
            <TextInput
              style={[s.input, s.ltrInput]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              value={p1}
              onChangeText={setP1}
              maxLength={128}
            />
            <TouchableOpacity onPress={() => setShow(!show)}>
              <Ionicons
                name={show ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          <Text style={s.helper}>٦ أحرف على الأقل</Text>

          <Text style={[s.label, { marginTop: 12 }]}>تأكيد كلمة المرور</Text>
          <View style={s.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={{ marginLeft: 12 }}
            />
            <TextInput
              style={[s.input, s.ltrInput]}
              placeholder="تأكيد كلمة المرور"
              placeholderTextColor="#999"
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              value={p2}
              onChangeText={setP2}
              maxLength={128}
            />
          </View>
          {p2.length > 0 && p1 !== p2 && (
            <Text style={s.error}>كلمتا المرور غير متطابقتين</Text>
          )}

          <TouchableOpacity
            style={[s.btn, !valid && s.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading || !valid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>حفظ</Text>
            )}
          </TouchableOpacity>
        </View>
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
    fontSize: 22,
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
    fontFamily: "Cairo-Regular",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.text, textAlign: "right" },
  ltrInput: { textAlign: "left", writingDirection: "ltr" },
  helper: { color: "#777", marginTop: 6, fontFamily: "Cairo-Regular" },
  error: { color: "#E53935", marginTop: 6, fontWeight: "700" },
  btn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Cairo-Bold" },
});
