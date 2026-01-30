import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  ArabonItem,
  UpdateArabonPayload,
  ArabonStatus,
  ArabonBookingPeriod,
} from "@/types/types";
import { getArabonDetails, updateArabon } from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import { uploadArabonImageToBunny } from "@/utils/uploadToBunny";
import COLORS from "@/constants/colors";

const MAX_IMAGES = 8;
const ARABON_CATEGORIES = ["منشأة", "شاليه", "صالة", "أخرى"] as const;

type RouteProps = RouteProp<RootStackParamList, "ArabonEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArabonEdit">;

const ArabonEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [originalItem, setOriginalItem] = useState<ArabonItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempScheduleDate, setTempScheduleDate] = useState<Date | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);

  const [formData, setFormData] = useState<UpdateArabonPayload>({
    title: "",
    description: "",
    depositAmount: undefined,
    scheduleAt: undefined,
    metadata: { guests: undefined, notes: "" },
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getArabonDetails(itemId);
      setOriginalItem(itemData);
      setExistingImageUrls(itemData.images || []);

      setFormData({
        title: itemData.title,
        description: itemData.description || "",
        depositAmount: itemData.depositAmount,
        scheduleAt: itemData.scheduleAt,
        metadata: itemData.metadata || { guests: undefined, notes: "" },
        status: itemData.status,
        contactPhone: itemData.contactPhone,
        socialLinks: itemData.socialLinks,
        category: itemData.category,
        bookingPrice: itemData.bookingPrice,
        bookingPeriod: itemData.bookingPeriod || "day",
        pricePerPeriod: itemData.pricePerPeriod,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات العربون:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل البيانات");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const pickImages = async () => {
    const total = existingImageUrls.length + newImageUris.length;
    if (total >= MAX_IMAGES) {
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
      const combined = [...newImageUris, ...added].slice(0, MAX_IMAGES - existingImageUrls.length);
      setNewImageUris(combined);
    } catch {
      Alert.alert("خطأ", "فشل اختيار الصور");
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان العربون");
      return;
    }

    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (newImageUris.length > 0) {
        setUploadingImages(true);
        for (const uri of newImageUris) {
          const url = await uploadArabonImageToBunny(uri);
          uploadedUrls.push(url);
        }
        setUploadingImages(false);
      }

      const payload: UpdateArabonPayload = {
        ...formData,
        images: [...existingImageUrls, ...uploadedUrls],
        contactPhone: formData.contactPhone?.trim() || undefined,
        socialLinks:
          Object.keys(formData.socialLinks || {}).length > 0
            ? formData.socialLinks
            : undefined,
      };

      await updateArabon(itemId, payload);
      Alert.alert("نجح", "تم تحديث العربون بنجاح", [
        { text: "موافق", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("خطأ في تحديث العربون:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء تحديث العربون. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateArabonPayload, value: any) => {
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

  const handleDateChange = (event: { type?: string } | undefined, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setTimeout(() => setShowDatePicker(false), 100);
      return;
    }
    if (selectedDate) {
      if (Platform.OS === "android") {
        setTempScheduleDate((prev) => {
          const base = prev ? new Date(prev) : new Date();
          base.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );
          return new Date(base);
        });
      } else {
        updateFormData("scheduleAt", selectedDate.toISOString());
        setShowDatePicker(false);
      }
    }
  };

  const handleTimeChange = (event: { type?: string } | undefined, selectedTime?: Date) => {
    if (event?.type === "dismissed") {
      setTimeout(() => setShowDatePicker(false), 100);
      return;
    }
    if (selectedTime) {
      setTempScheduleDate((prev) => {
        const base = prev ? new Date(prev) : new Date();
        base.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        return new Date(base);
      });
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return COLORS.gray;
      case "pending":
        return COLORS.orangeDark;
      case "confirmed":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة";
      case "pending":
        return "في الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  const isOwner = user && originalItem && String(originalItem.ownerId) === user.uid;

  if (!isOwner) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>ليس لديك صلاحية تعديل هذا العربون</Text>
      </View>
    );
  }

  const allImagesCount = existingImageUrls.length + newImageUris.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعديل العربون</Text>
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
              placeholder="عنوان العربون"
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
              placeholder="وصف تفصيلي..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صور العقار (حد أقصى {MAX_IMAGES})</Text>
            <View style={styles.imagesRow}>
              {existingImageUrls.map((url, i) => (
                <View key={`ex-${i}`} style={styles.imageWrap}>
                  <Image source={{ uri: url }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeExistingImage(i)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              {newImageUris.map((uri, i) => (
                <View key={`new-${i}`} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeNewImage(i)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              {allImagesCount < MAX_IMAGES && (
                <TouchableOpacity
                  style={styles.addImageBtn}
                  onPress={pickImages}
                  disabled={saving || uploadingImages}
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
              placeholder="+967771234567"
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
            <Text style={styles.sectionTitle}>السعر لكل فترة (ريال)</Text>
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
            <Text style={styles.sectionTitle}>قيمة العربون (ريال)</Text>
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
              onPress={() => {
                setTempScheduleDate(
                  formData.scheduleAt ? new Date(formData.scheduleAt) : new Date()
                );
                setShowDatePicker(true);
              }}
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
              <View>
                {Platform.OS === "android" ? (
                  <>
                    <View style={styles.dateTimePickersRow}>
                      <DateTimePicker
                        value={
                          tempScheduleDate ||
                          (formData.scheduleAt ? new Date(formData.scheduleAt) : new Date())
                        }
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                      />
                      <DateTimePicker
                        value={
                          tempScheduleDate ||
                          (formData.scheduleAt ? new Date(formData.scheduleAt) : new Date())
                        }
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                        is24Hour
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.dateConfirmBtn}
                      onPress={() => {
                        const base =
                          tempScheduleDate ||
                          (formData.scheduleAt ? new Date(formData.scheduleAt) : new Date());
                        updateFormData("scheduleAt", base.toISOString());
                        setTempScheduleDate(null);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.dateConfirmBtnText}>تم</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <DateTimePicker
                    value={formData.scheduleAt ? new Date(formData.scheduleAt) : new Date()}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>
            <TextInput
              style={styles.textInput}
              value={formData.metadata?.guests?.toString() || ""}
              onChangeText={(v) =>
                updateMetadata("guests", v ? parseInt(v) : undefined)
              }
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
            <Text style={styles.sectionTitle}>حالة العربون</Text>
            <View style={styles.statusSelector}>
              {(
                [
                  "draft",
                  "pending",
                  "confirmed",
                  "completed",
                  "cancelled",
                ] as ArabonStatus[]
              ).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && [
                      styles.statusOptionSelected,
                      { borderColor: getStatusColor(status) },
                    ],
                  ]}
                  onPress={() => updateFormData("status", status)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      formData.status === status && styles.statusOptionTextSelected,
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (saving || uploadingImages) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={saving || uploadingImages}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="save" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>حفظ التغييرات</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: { marginTop: 16, fontSize: 16, fontFamily: "Cairo-Regular", color: COLORS.textLight },
  errorText: { fontSize: 16, fontFamily: "Cairo-Regular", color: COLORS.danger, textAlign: "center", marginTop: 16 },
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
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  scrollContainer: { flex: 1 },
  formContainer: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
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
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    backgroundColor: COLORS.white,
    marginBottom: 8,
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
  addImageText: { fontSize: 12, fontFamily: "Cairo-Regular", color: COLORS.primary, marginTop: 4 },
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
  dateText: { fontSize: 16, fontFamily: "Cairo-Regular", color: COLORS.text },
  placeholderText: { fontFamily: "Cairo-Regular", color: COLORS.textLight },
  dateTimePickersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dateConfirmBtn: {
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  dateConfirmBtnText: { color: COLORS.white, fontFamily: "Cairo-SemiBold", fontSize: 16 },
  statusSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statusOptionSelected: { borderWidth: 2 },
  statusOptionText: { fontSize: 14, fontFamily: "Cairo-SemiBold", color: COLORS.text },
  statusOptionTextSelected: { fontFamily: "Cairo-SemiBold" },
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
    fontFamily: "Cairo-SemiBold",
    marginLeft: 8,
  },
});

export default ArabonEditScreen;
