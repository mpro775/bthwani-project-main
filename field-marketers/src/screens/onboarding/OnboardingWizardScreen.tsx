// OnboardingWizardScreen.tsx
// شاشة مُحسنة وعصرية لمرحلة إضافة المتجر - مصممة وفق ألوان الهوية (COLORS) وخط Cairo

import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import MapPicker from "../../components/MapPicker";
import * as ImagePicker from "expo-image-picker";
import { askLocation } from "../../services/location";
import { api } from "../../api/client"; // axios مهيأ مع التوكن
import debounce from "lodash.debounce";
import COLORS from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import { uploadFileToBunny } from "../../services/upload";
import * as SecureStore from "expo-secure-store";

// Tip: استورد هذه الشاشة في الـ Navigator الخاص بك بصيغة .tsx

type Category = { _id: string; name: string; usageType?: string };

export default function OnboardingWizardScreen() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  // لون موحّد للبوليس هولدر
  const PH_COLOR = COLORS.blue; // غيّره للي يناسبك (مثلاً COLORS.border أو لون رمادي)

  const [step, setStep] = useState(1);

  // store
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number }>({
    lat: 15.3694,
    lng: 44.191,
  });

  // vendor
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  // participants
  const [leadUid, setLeadUid] = useState("");
  const [supportUid, setSupportUid] = useState("");
  const [weights, setWeights] = useState({ lead: 0.5, support: 0.5 });

  // attachments & images
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [logoUri, setLogoUri] = useState<string | undefined>();
  const [attachments, setAttachments] = useState<{ uri: string }[]>([]);

  // categories data
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Select modal
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // fetch categories
  const fetchCategories = async (q?: string) => {
    setCatLoading(true);
    setCatError(null);
    try {
      const res = await api.get<Category[]>("/delivery/categories", {
        params: q ? { q } : {},
      });
      setCategories(res.data || []);
    } catch (e: any) {
      setCatError(e?.response?.data?.message || e?.message || "فشل جلب الفئات");
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // debounced search when user types in modal
  const debouncedSearch = useMemo(
    () => debounce((text: string) => fetchCategories(text), 400),
    []
  );
  useEffect(() => {
    debouncedSearch(catSearch);
  }, [catSearch]);

  // image picker helper
  const pickImage = async (onPick: (uri: string) => void) => {
    try {
      const p = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!p.canceled) onPick(p.assets[0].uri);
    } catch (e) {
      Alert.alert("خطأ", "فشل اختيار الصورة");
    }
  };

  const removeAttachment = (index: number) =>
    setAttachments((p) => p.filter((_, i) => i !== index));
  const removeImage = () => setImageUri(undefined);
  const removeLogo = () => setLogoUri(undefined);

  const makeIdempotencyKey = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  // Validation helper
  const validateBeforeSubmit = () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert("مربعات مطلوبة", "الاسم و العنوان مطلوبان");
      return false;
    }
    if (!category) {
      Alert.alert("اختيار الفئة", "رجاء اختر فئة للمتجر");
      return false;
    }
    if (!ownerName.trim() || !ownerPhone.trim() || ownerPassword.length < 8) {
      Alert.alert("بيانات التاجر", "المالك، الهاتف وكلمة مرور >= 8 مطلوبة");
      return false;
    }
    if (!loc?.lat || !loc?.lng) {
      Alert.alert("موقع المتجر", "حدد موقعًا صحيحًا على الخريطة");
      return false;
    }
    if (weights.lead + weights.support > 1.001) {
      Alert.alert("موزونات المشاركين", "مجموع الأوزان يجب ألا يتجاوز 1.0");
      return false;
    }
    return true;
  };

  // submit flow
  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) return;
    setSubmitting(true);

    try {
      // 1) upload images sequentially (or in parallel)
      setUploadingFiles(true);
      let imageUrl: string | undefined = undefined;
      let logoUrl: string | undefined = undefined;
      const attachmentsUrls: string[] = [];
      console.log(
        "api.defaults.headers.common.Authorization:",
        api.defaults.headers.common?.Authorization
      );
      console.log(
        "saved mk_token:",
        await SecureStore.getItemAsync("mk_token")
      );
      if (imageUri) imageUrl = await uploadFileToBunny(imageUri as any);
      if (logoUri) logoUrl = await uploadFileToBunny(logoUri as any);

      for (const a of attachments) {
        const u = await uploadFileToBunny(a.uri as any);
        attachmentsUrls.push(u);
      }
      setUploadingFiles(false);

      // 2) payload
      const payload = {
        store: {
          name: name.trim(),
          address: address.trim(),
          category: category!._id,
          location: { lat: Number(loc.lat), lng: Number(loc.lng) },
          image: imageUrl,
          logo: logoUrl,
          tags: [],
        },
        vendor: {
          fullName: ownerName.trim(),
          phone: ownerPhone.trim(),
          email: ownerEmail?.trim() || undefined,
          password: ownerPassword,
        },
        participants: [
          leadUid
            ? {
                uid: leadUid.trim(),
                role: "lead",
                weight: Number(weights.lead) || 0,
              }
            : null,
          supportUid
            ? {
                uid: supportUid.trim(),
                role: "support",
                weight: Number(weights.support) || 0,
              }
            : null,
        ].filter(Boolean),
        idempotencyKey: makeIdempotencyKey(),
        attachments: attachmentsUrls.length
          ? attachmentsUrls.map((u) => ({ url: u }))
          : undefined,
      };

      // 3) call API
      await api.post("/field/quick-onboard", payload);

      Alert.alert("تم", "تم إرسال الطلب — بانتظار تفعيل الإدارة");
      resetForm();
    } catch (e: any) {
      console.error("quick-onboard error:", e);
      Alert.alert("فشل", e?.response?.data?.message || e?.message || "حصل خطأ");
    } finally {
      setUploadingFiles(false);
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setName("");
    setAddress("");
    setCategory(null);
    setLoc({ lat: 15.3694, lng: 44.191 });
    setOwnerName("");
    setOwnerPhone("");
    setOwnerEmail("");
    setOwnerPassword("");
    setLeadUid("");
    setSupportUid("");
    setWeights({ lead: 0.5, support: 0.5 });
    setImageUri(undefined);
    setLogoUri(undefined);
    setAttachments([]);
  };

  // UI helper: category display
  const catLabel = category ? `${category.name}` : "اختر فئة المتجر";

  // step navigation
  const next = () => setStep((p) => Math.min(5, p + 1));
  const prev = () => setStep((p) => Math.max(1, p - 1));

  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundSecondary]}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>إضافة متجر جديد</Text>
          <Text style={styles.sub}>خطوة {step} من 5</Text>
          <View style={styles.progressRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i <= step ? styles.stepDotActive : styles.stepDotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Step 1 */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.h2}>بيانات المتجر</Text>
            <TextInput
              style={styles.inp}
              placeholder="اسم المتجر"
              placeholderTextColor={PH_COLOR}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.inp}
              placeholder="العنوان"
              placeholderTextColor={PH_COLOR}
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity
              style={styles.select}
              onPress={() => setCatModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text
                style={category ? styles.selectText : styles.selectPlaceholder}
              >
                {catLabel}
              </Text>
            </TouchableOpacity>

            <View style={{ marginVertical: 12 }}>
              <MapPicker
                value={loc}
                onChange={setLoc}
                containerStyle={{
                  height: 180,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.btnSm}
              onPress={async () => {
                const here = await askLocation();
                if (here) setLoc(here);
              }}
            >
              <Text style={styles.btnSmTx}>استخدم موقعي الحالي</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.h2}>بيانات صاحب المتجر / التاجر</Text>
            <TextInput
              style={styles.inp}
              placeholder="اسم المالك"
              placeholderTextColor={PH_COLOR}
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <TextInput
              style={styles.inp}
              placeholder="هاتف"
              placeholderTextColor={PH_COLOR}
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.inp}
              placeholder="بريد (اختياري)"
              placeholderTextColor={PH_COLOR}
              value={ownerEmail}
              onChangeText={setOwnerEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.inp}
              placeholder="كلمة المرور للتاجر (>=8)"
              placeholderTextColor={PH_COLOR}
              value={ownerPassword}
              onChangeText={setOwnerPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.h2}>المشاركون (اختياري)</Text>
            <TextInput
              style={styles.inp}
              placeholder="UID المسوّق الرئيسي"
              placeholderTextColor={PH_COLOR}
              value={leadUid}
              onChangeText={setLeadUid}
            />
            <TextInput
              style={styles.inp}
              placeholder="UID المساند"
              placeholderTextColor={PH_COLOR}
              value={supportUid}
              onChangeText={setSupportUid}
            />

            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={[styles.inp, { flex: 1, marginRight: 8 }]}
                placeholder="وزن الرئيسي (0-1)"
                placeholderTextColor={PH_COLOR}
                keyboardType="decimal-pad"
                value={String(weights.lead)}
                onChangeText={(t) =>
                  setWeights((w) => ({ ...w, lead: Number(t || 0) }))
                }
              />
              <TextInput
                style={[styles.inp, { flex: 1 }]}
                placeholder="وزن المساند (0-1)"
                placeholderTextColor={PH_COLOR}
                keyboardType="decimal-pad"
                value={String(weights.support)}
                onChangeText={(t) =>
                  setWeights((w) => ({ ...w, support: Number(t || 0) }))
                }
              />
            </View>

            <Text style={styles.hint}>
              (مثال: 0.5 / 0.5 — المجموع يجب ألا يتجاوز 1.0)
            </Text>
          </View>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <View style={styles.card}>
            <Text style={styles.h2}>صور ومرفقات</Text>
            <View style={styles.imagesRow}>
              <View style={styles.imgBoxWrap}>
                <TouchableOpacity
                  style={styles.imgBox}
                  onPress={() => pickImage(setImageUri)}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imgPreview}
                    />
                  ) : (
                    <Text style={styles.imgPlaceholder}>صورة الواجهة</Text>
                  )}
                </TouchableOpacity>
                {imageUri ? (
                  <TouchableOpacity
                    onPress={removeImage}
                    style={styles.removeSmall}
                  >
                    <Text style={styles.removeSmallTx}>حذف</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.imgBoxWrap}>
                <TouchableOpacity
                  style={styles.imgBox}
                  onPress={() => pickImage(setLogoUri)}
                >
                  {logoUri ? (
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.imgPreview}
                    />
                  ) : (
                    <Text style={styles.imgPlaceholder}>شعار</Text>
                  )}
                </TouchableOpacity>
                {logoUri ? (
                  <TouchableOpacity
                    onPress={removeLogo}
                    style={styles.removeSmall}
                  >
                    <Text style={styles.removeSmallTx}>حذف</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnSm, { marginTop: 12 }]}
              onPress={() =>
                pickImage((uri) => setAttachments((p) => [...p, { uri }]))
              }
            >
              <Text style={styles.btnSmTx}>إضافة مرفق</Text>
            </TouchableOpacity>

            {attachments.length ? (
              <View style={{ marginTop: 10 }}>
                {attachments.map((a, i) => (
                  <View key={i} style={styles.attachRow}>
                    <Text style={styles.attachText}>
                      مرفق {i + 1}: {a.uri.split("/").pop()}
                    </Text>
                    <TouchableOpacity onPress={() => removeAttachment(i)}>
                      <Text style={styles.removeSmallTx}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <View style={styles.card}>
            <Text style={styles.h2}>مراجعة</Text>
            <Text style={styles.revItem}>
              اسم: <Text style={styles.revValue}>{name}</Text>
            </Text>
            <Text style={styles.revItem}>
              عنوان: <Text style={styles.revValue}>{address}</Text>
            </Text>
            <Text style={styles.revItem}>
              فئة: <Text style={styles.revValue}>{category?.name || "—"}</Text>
            </Text>
            <Text style={styles.revItem}>
              موقع:{" "}
              <Text style={styles.revValue}>
                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
              </Text>
            </Text>
            <Text style={styles.revItem}>
              مالك:{" "}
              <Text style={styles.revValue}>
                {ownerName} / {ownerPhone}
              </Text>
            </Text>
            <Text style={styles.revItem}>
              مشاركون:{" "}
              <Text style={styles.revValue}>
                {leadUid ? `${leadUid}(${weights.lead})` : "—"}{" "}
                {supportUid ? `+ ${supportUid}(${weights.support})` : ""}
              </Text>
            </Text>
            {!!imageUri && (
              <Text style={styles.successLine}>✓ صورة واجهة مرفوعة</Text>
            )}
            {!!logoUri && <Text style={styles.successLine}>✓ شعار مرفوع</Text>}
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.btn, step === 1 ? styles.btnDisabled : null]}
            onPress={prev}
            disabled={step === 1 || submitting}
          >
            <Text style={styles.btnTx}>السابق</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.primaryBtn,
              submitting || uploadingFiles ? { opacity: 0.7 } : null,
            ]}
            onPress={async () => {
              if (step < 5) next();
              else await handleSubmit();
            }}
            disabled={submitting || uploadingFiles}
          >
            {submitting || uploadingFiles ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={[styles.btnTx, { color: COLORS.white }]}>
                {step < 5 ? "التالي" : "إنهاء الإنشاء"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Categories modal */}
        <Modal visible={catModalVisible} animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalHeader}>
              <TextInput
                placeholder="بحث عن فئة..."
                value={catSearch}
                onChangeText={setCatSearch}
                style={[styles.inp, { flex: 1 }]}
              />
              <Pressable
                onPress={() => setCatModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseTxt}>إغلاق</Text>
              </Pressable>
            </View>

            {catLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : catError ? (
              <Text style={{ color: COLORS.danger, marginTop: 12 }}>
                {catError}
              </Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(i) => i._id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setCategory(item);
                      setCatModalVisible(false);
                    }}
                    style={styles.catRow}
                  >
                    <Text style={styles.catName}>{item.name}</Text>
                    {item.usageType ? (
                      <Text style={styles.catUsage}>{item.usageType}</Text>
                    ) : null}
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={{ marginTop: 12, textAlign: "center" }}>
                    لا توجد فئات
                  </Text>
                }
              />
            )}
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, paddingBottom: 36 },
  header: { marginBottom: 12, marginTop: 24 },
  title: {
    fontSize: 22,
    fontFamily: "Cairo_700Bold",
    color: COLORS.blue,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  progressRow: { flexDirection: "row", marginTop: 10, gap: 8 },
  stepDot: { width: 18, height: 6, borderRadius: 6, marginRight: 6 },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotInactive: { backgroundColor: COLORS.borderLight },

  card: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  h2: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.dark,
    marginBottom: 10,
  },
  inp: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    fontFamily: "Cairo_400Regular",
  },
  select: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  selectText: { fontFamily: "Cairo_600SemiBold", },
  selectPlaceholder: {
    color: COLORS.blue,
    opacity: 0.6,              // ← تعتيم بسيط ليبان أنه Placeholder
    fontFamily: "Cairo_400Regular",
  },

  imagesRow: { flexDirection: "row", gap: 10 },
  imgBoxWrap: { alignItems: "center" },
  imgBox: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: COLORS.background,
  },
  imgPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  imgPlaceholder: { color: COLORS.blue },
  removeSmall: { marginTop: 6 },
  removeSmallTx: { color: COLORS.danger, fontFamily: "Cairo_600SemiBold" },

  btn: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 120,
    backgroundColor: COLORS.backgroundSecondary,
  },
  primaryBtn: { backgroundColor: COLORS.primary },
  btnTx: { fontFamily: "Cairo_600SemiBold", color: COLORS.blue },
  btnDisabled: { opacity: 0.5 },
  btnSm: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  btnSmTx: { fontFamily: "Cairo_600SemiBold", color: COLORS.blue },

  hint: { color: COLORS.blue, fontFamily: "Cairo_400Regular" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  modalWrap: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modalClose: { padding: 8, marginLeft: 8 },
  modalCloseTxt: { color: COLORS.primary, fontFamily: "Cairo_600SemiBold" },
  catRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
    catName: { fontFamily: "Cairo_600SemiBold", color: COLORS.blue },
  catUsage: {
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
    marginTop: 4,
  },

  attachRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  attachText: { color: COLORS.blue, fontFamily: "Cairo_400Regular" },

  revItem: {
    marginBottom: 8,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.blue,
  },
  revValue: { fontFamily: "Cairo_400Regular", color: COLORS.blue },
  successLine: {
    color: COLORS.success,
    marginTop: 8,
    fontFamily: "Cairo_600SemiBold",
  },
});

// نهاية الملف
