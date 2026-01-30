import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  CreateArabonPayload,
  ArabonStatus,
  ArabonBookingPeriod,
} from "@/types/types";
import { createArabon } from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import { uploadArabonImageToBunny } from "@/utils/uploadToBunny";
import COLORS from "@/constants/colors";

const MAX_IMAGES = 8;
const ARABON_CATEGORIES = ["منشأة", "شاليه", "صالة", "أخرى"] as const;
const BOOKING_PERIOD_LABELS: Record<ArabonBookingPeriod, string> = {
  hour: "بالساعة",
  day: "باليوم",
  week: "بالأسبوع",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArabonCreate">;

const ArabonCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateArabonPayload>({
    ownerId: user?.uid || "",
    title: "",
    description: "",
    depositAmount: undefined,
    scheduleAt: undefined,
    metadata: { guests: undefined, notes: "" },
    status: "draft",
    images: [],
    contactPhone: "",
    socialLinks: {},
    category: undefined,
    bookingPrice: undefined,
    bookingPeriod: "day",
    pricePerPeriod: undefined,
  });

  const pickImages = async () => {
    if (imageUris.length >= MAX_IMAGES) {
      Alert.alert("حد أقصى", `يمكنك إضافة حتى ${MAX_IMAGES} صور فقط`);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const added = result.assets.map((a) => a.uri);
      const combined = [...imageUris, ...added].slice(0, MAX_IMAGES);
      setImageUris(combined);
    } catch {
      Alert.alert("خطأ", "فشل اختيار الصور");
    }
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان العربون");
      return;
    }
    if (!formData.ownerId) {
      Alert.alert("خطأ", "يجب تسجيل الدخول أولاً");
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageUris.length > 0) {
        setUploadingImages(true);
        for (const uri of imageUris) {
          const url = await uploadArabonImageToBunny(uri);
          imageUrls.push(url);
        }
        setUploadingImages(false);
      }

      const payload: CreateArabonPayload = {
        ...formData,
        images: imageUrls.length ? imageUrls : undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        socialLinks:
          Object.keys(formData.socialLinks || {}).length > 0
            ? formData.socialLinks
            : undefined,
      };
      await createArabon(payload);
      Alert.alert("نجح", "تم إنشاء العربون بنجاح", [
        { text: "موافق", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("خطأ في إنشاء العربون:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء إنشاء العربون. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const updateFormData = (field: keyof CreateArabonPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLinks = (key: "whatsapp" | "facebook" | "instagram", value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value || undefined },
    }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) updateFormData("scheduleAt", selectedDate.toISOString());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة إعلان استئجار</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(v) => updateFormData("title", v)}
              placeholder="مثال: شاليه فاخر للإيجار"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع العقار</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(v) => updateFormData("category", v)}
                style={styles.picker}
              >
                <Picker.Item label="اختر النوع" value={undefined} />
                {ARABON_CATEGORIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(v) => updateFormData("description", v)}
              placeholder="وصف تفصيلي للعقار..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صور العقار (حد أقصى {MAX_IMAGES})</Text>
            <View style={styles.imagesRow}>
              {imageUris.map((uri, i) => (
                <View key={i} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(i)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              {imageUris.length < MAX_IMAGES && (
                <TouchableOpacity
                  style={styles.addImageBtn}
                  onPress={pickImages}
                  disabled={loading || uploadingImages}
                >
                  <Ionicons name="add" size={32} color={COLORS.primary} />
                  <Text style={styles.addImageText}>إضافة</Text>
                </TouchableOpacity>
              )}
            </View>
            {uploadingImages && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.uploadingText}>جاري رفع الصور...</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>رقم التواصل للحجز</Text>
            <TextInput
              style={styles.textInput}
              value={formData.contactPhone || ""}
              onChangeText={(v) => updateFormData("contactPhone", v)}
              placeholder="مثال: +967771234567"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صفحات التواصل</Text>
            <TextInput
              style={styles.textInput}
              value={formData.socialLinks?.whatsapp || ""}
              onChangeText={(v) => updateSocialLinks("whatsapp", v)}
              placeholder="رابط واتساب"
              placeholderTextColor={COLORS.textLight}
              keyboardType="url"
            />
            <TextInput
              style={[styles.textInput, styles.textInputMargin]}
              value={formData.socialLinks?.facebook || ""}
              onChangeText={(v) => updateSocialLinks("facebook", v)}
              placeholder="رابط فيسبوك"
              placeholderTextColor={COLORS.textLight}
              keyboardType="url"
            />
            <TextInput
              style={[styles.textInput, styles.textInputMargin]}
              value={formData.socialLinks?.instagram || ""}
              onChangeText={(v) => updateSocialLinks("instagram", v)}
              placeholder="رابط إنستغرام"
              placeholderTextColor={COLORS.textLight}
              keyboardType="url"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فترة الحجز</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bookingPeriod || "day"}
                onValueChange={(v) => updateFormData("bookingPeriod", v)}
                style={styles.picker}
              >
                <Picker.Item label="بالساعة" value="hour" />
                <Picker.Item label="باليوم" value="day" />
                <Picker.Item label="بالأسبوع" value="week" />
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              السعر لكل فترة (ريال) - {BOOKING_PERIOD_LABELS[(formData.bookingPeriod || "day") as ArabonBookingPeriod]}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.pricePerPeriod?.toString() || ""}
              onChangeText={(v) => {
                const n = v ? parseFloat(v) : undefined;
                updateFormData("pricePerPeriod", n);
              }}
              placeholder="مثال: 500"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>قيمة الحجز الكاملة (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.bookingPrice?.toString() || ""}
              onChangeText={(v) => {
                const n = v ? parseFloat(v) : undefined;
                updateFormData("bookingPrice", n);
              }}
              placeholder="اختياري"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>قيمة العربون المطلوب تحويلها (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.depositAmount?.toString() || ""}
              onChangeText={(v) => {
                const n = v ? parseFloat(v) : undefined;
                updateFormData("depositAmount", n);
              }}
              placeholder="مثال: 250.50"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>موعد التنفيذ</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dateText,
                  !formData.scheduleAt && styles.placeholderText,
                ]}
              >
                {formData.scheduleAt ? formatDate(formData.scheduleAt) : "اختر التاريخ والوقت"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.scheduleAt ? new Date(formData.scheduleAt) : new Date()}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>
            <TextInput
              style={styles.textInput}
              value={formData.metadata?.guests?.toString() || ""}
              onChangeText={(v) => updateMetadata("guests", v ? parseInt(v) : undefined)}
              placeholder="عدد الأشخاص"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
            <TextInput
              style={[styles.textInput, styles.textArea, styles.textInputMargin]}
              value={formData.metadata?.notes || ""}
              onChangeText={(v) => updateMetadata("notes", v)}
              placeholder="ملاحظات"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={2}
              maxLength={200}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الحالة الأولية</Text>
            <View style={styles.statusSelector}>
              {[
                { key: "draft" as const, label: "مسودة" },
                { key: "pending" as const, label: "في الانتظار" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusOption,
                    formData.status === s.key && styles.statusOptionSelected,
                  ]}
                  onPress={() => updateFormData("status", s.key)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      formData.status === s.key && styles.statusOptionTextSelected,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (loading || uploadingImages) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || uploadingImages}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>إنشاء الإعلان</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  scrollContainer: { flex: 1 },
  formContainer: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textInputMargin: { marginTop: 8 },
  textArea: { height: 80, textAlignVertical: "top" as const },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  picker: { height: 48 },
  imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageWrap: { position: "relative" },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeImageBtn: { position: "absolute", top: -8, right: -8 },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  uploadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  uploadingText: { fontSize: 14, color: COLORS.textLight },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  dateText: { fontSize: 16, color: COLORS.text },
  placeholderText: { color: COLORS.textLight },
  statusSelector: { flexDirection: "row", gap: 12 },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  statusOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  statusOptionText: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  statusOptionTextSelected: { color: COLORS.primary, fontWeight: "600" },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: { backgroundColor: COLORS.gray },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ArabonCreateScreen;
