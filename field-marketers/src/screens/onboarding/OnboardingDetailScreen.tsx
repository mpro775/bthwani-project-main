import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useOnboarding } from "../../hooks/useOnboarding";

export default function OnboardingDetailScreen() {
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const passedItem = route.params?.item; // إن مررته من القائمة
  const { getOne, submitDraft } = useOnboarding();

  const [doc, setDoc] = useState<any>(passedItem || null);
  const [loading, setLoading] = useState(!passedItem);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (passedItem) return; // لدينا بيانات ممرّرة
      try {
        setLoading(true);
        const data = await getOne(id);
        if (mounted) setDoc(data);
      } catch (e: any) {
        Alert.alert("خطأ", e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!doc) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text>لا يوجد مستند بهذا المعرف.</Text>
      </View>
    );
  }

  // دعم الشكلين: Onboarding (storeDraft/status) أو Store (store/* من استجابة أخرى)
  const storeName = doc.storeDraft?.name ?? doc.store?.name ?? "—";
  const storeAddr = doc.storeDraft?.address ?? doc.store?.address ?? "—";
  const status = doc.status; // متاح فقط في Onboarding
  const isStoreOnly = !status; // لو ما فيه status اعتبره Store

  const badgeStyle =
    status === "approved"
      ? s.g
      : status === "needs_fix"
      ? s.w
      : status === "rejected"
      ? s.r
      : s.d;

  const statusText = status
    ? mapStatus(status)
    : doc.activation?.store
    ? "المتجر مفعّل"
    : doc.activation?.vendor
    ? "تاجر نشِط"
    : "غير مفعّل";

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={s.h1}>{storeName}</Text>
      <Text style={s.grey}>{storeAddr}</Text>

      <Text style={[s.badge, badgeStyle]}>{statusText}</Text>

      {!isStoreOnly && status === "needs_fix" && (
        <View style={s.cardWarn}>
          <Text style={s.warnTitle}>ملاحظات المراجع</Text>
          <Text style={{ color: "#7c2d12" }}>{doc.notes || "—"}</Text>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: "#0a84ff", marginTop: 10 }]}
            onPress={async () => {
              try {
                await submitDraft(doc._id);
                Alert.alert("تم الإرسال", "أُعيد الطلب للمراجعة");
                // إعادة الجلب
                try {
                  const data = await getOne(id);
                  setDoc(data);
                } catch {}
              } catch (e: any) {
                Alert.alert("خطأ", e?.response?.data?.message || e.message);
              }
            }}
          >
            <Text style={s.btnTx}>إعادة الإرسال</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isStoreOnly && (
        <>
          <View style={s.card}>
            <Text style={s.h1}>المالك</Text>
            <Text>الاسم: {doc.ownerDraft?.fullName || "—"}</Text>
            <Text>الهاتف: {doc.ownerDraft?.phone || "—"}</Text>
            <Text>البريد: {doc.ownerDraft?.email || "—"}</Text>
          </View>

          <View style={s.card}>
            <Text style={s.h1}>المشاركون</Text>
            {(doc.participants || []).length ? (
              (doc.participants || []).map((p: any, i: number) => (
                <Text key={i}>
                  {`ID: ${p.marketerId || p.uid || "—"} • الدور: ${
                    p.role || "—"
                  } • الوزن: ${p.weight ?? 0.5}`}
                </Text>
              ))
            ) : (
              <Text>—</Text>
            )}
          </View>

          <View style={s.card}>
            <Text style={s.h1}>مرفقات</Text>
            {(doc.attachments || []).length ? (
              (doc.attachments || []).map((a: any, i: number) => (
                <Text key={i}>
                  • {a.kind || "image"} — {a.url}
                </Text>
              ))
            ) : (
              <Text>—</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function mapStatus(s: string) {
  switch (s) {
    case "approved":
      return "معتمد";
    case "needs_fix":
      return "تحتاج تعديل";
    case "rejected":
      return "مرفوض";
    case "submitted":
      return "مُرسَل";
    case "draft":
      return "مسودة";
    default:
      return "غير معروف";
  }
}

const s = StyleSheet.create({
  h1: { fontSize: 20,  fontFamily: "Cairo_600SemiBold", marginBottom: 6 },
  grey: { color: "#666", fontFamily: "Cairo_400Regular" },
  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    color: "#fff",
    fontFamily: "Cairo_600SemiBold",
  },
  g: { backgroundColor: "#22c55e" },
  r: { backgroundColor: "#ef4444" },
  w: { backgroundColor: "#f59e0b" },
  d: { backgroundColor: "#6b7280" },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  cardWarn: {
    borderWidth: 1,
    borderColor: "#fef08a",
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  warnTitle: { fontWeight: "800", color: "#7c2d12", marginBottom: 6 },
  btn: { padding: 12, borderRadius: 10, alignItems: "center" },
  btnTx: { color: "#fff", fontWeight: "700" },
});
