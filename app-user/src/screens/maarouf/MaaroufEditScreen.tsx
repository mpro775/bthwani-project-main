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
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  MaaroufItem,
  UpdateMaaroufPayload,
  MaaroufKind,
  MaaroufCategory,
  MAAROUF_CATEGORIES,
} from "@/types/types";
import {
  getMaaroufDetails,
  updateMaarouf,
  uploadMaaroufImage,
} from "@/api/maaroufApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "MaaroufEdit">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MaaroufEdit"
>;

const MaaroufEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<MaaroufItem | null>(null);

  const [formData, setFormData] = useState<UpdateMaaroufPayload>({
    title: "",
    description: "",
    kind: undefined,
    tags: [],
    metadata: {},
    status: undefined,
    mediaUrls: [],
    category: "other",
    reward: 0,
  });

  const [tagsInput, setTagsInput] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const MAX_IMAGES = 5;

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getMaaroufDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || "",
        kind: itemData.kind,
        tags: itemData.tags || [],
        metadata: itemData.metadata || {},
        status: itemData.status,
        mediaUrls: itemData.mediaUrls || [],
        category: itemData.category || "other",
        reward: itemData.reward || 0,
      });

      // Set tags input
      setTagsInput((itemData.tags || []).join(", "));

      // Set image URIs from existing mediaUrls
      setImageUris(itemData.mediaUrls || []);
    } catch (error) {
      console.error("خطأ في تحميل بيانات المعروف:", error);
      Alert.alert("خطأ", "حدث خطأ في تحميل البيانات");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الإعلان");
      return;
    }

    setSaving(true);
    try {
      const processedTags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      let mediaUrls: string[] = [];
      const existingUrls = imageUris.filter((uri) => uri.startsWith("http"));
      const newUris = imageUris.filter(
        (uri) => uri.startsWith("file://") || uri.startsWith("content://")
      );
      mediaUrls = [...existingUrls];
      if (newUris.length > 0) {
        setUploadingImages(true);
        for (const uri of newUris) {
          try {
            const url = await uploadMaaroufImage(uri);
            if (url) mediaUrls.push(url);
          } catch (e) {
            console.warn("فشل رفع صورة:", e);
          }
        }
        setUploadingImages(false);
      }

      const payload: UpdateMaaroufPayload = {
        ...formData,
        tags: processedTags,
        mediaUrls,
      };

      await updateMaarouf(itemId, payload);
      Alert.alert("نجح", "تم تحديث الإعلان بنجاح", [
        {
          text: "موافق",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("خطأ في تحديث الإعلان:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateMaaroufPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectKind = (kind: MaaroufKind) => {
    updateFormData("kind", kind);
  };

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
    } catch (e) {
      Alert.alert("خطأ", "فشل اختيار الصور");
    }
  };

  const removeImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCategory = (category: MaaroufCategory) => {
    updateFormData("category", category);
  };

  const selectStatus = (status: string) => {
    updateFormData("status", status);
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

  const isOwner = user && originalItem && originalItem.ownerId === user.uid;

  if (!isOwner) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>ليس لديك صلاحية تعديل هذا الإعلان</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعديل الإعلان</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* نوع الإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع الإعلان</Text>
            <View style={styles.kindSelector}>
              <TouchableOpacity
                style={[
                  styles.kindOption,
                  formData.kind === "lost" && styles.kindOptionSelected,
                ]}
                onPress={() => selectKind("lost")}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={
                    formData.kind === "lost" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.kindOptionText,
                    formData.kind === "lost" && styles.kindOptionTextSelected,
                  ]}
                >
                  مفقود
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.kindOption,
                  formData.kind === "found" && styles.kindOptionSelected,
                ]}
                onPress={() => selectKind("found")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={
                    formData.kind === "found" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.kindOptionText,
                    formData.kind === "found" && styles.kindOptionTextSelected,
                  ]}
                >
                  موجود
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* الصور */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الصور (حتى {MAX_IMAGES})</Text>
            <View style={styles.imageRow}>
              {imageUris.map((uri, index) => (
                <View key={index} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={COLORS.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {imageUris.length < MAX_IMAGES && (
                <TouchableOpacity
                  style={styles.addImageBtn}
                  onPress={pickImages}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Ionicons name="add" size={28} color={COLORS.primary} />
                      <Text style={styles.addImageText}>إضافة صورة</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* التصنيف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التصنيف</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {MAAROUF_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.categoryChip,
                    formData.category === c.value &&
                      styles.categoryChipSelected,
                  ]}
                  onPress={() => selectCategory(c.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === c.value &&
                        styles.categoryChipTextSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* المكافأة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مكافأة اختيارية (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.reward ? String(formData.reward) : ""}
              onChangeText={(v) =>
                updateFormData("reward", v ? parseInt(v, 10) || 0 : 0)
              }
              placeholder="0 = بدون مكافأة"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
          </View>

          {/* حالة الإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الإعلان</Text>
            <View style={styles.statusSelector}>
              {["draft", "pending", "confirmed", "completed", "cancelled"].map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && [
                        styles.statusOptionSelected,
                        { borderColor: getStatusColor(status) },
                      ],
                    ]}
                    onPress={() => selectStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.status === status &&
                          styles.statusOptionTextSelected,
                      ]}
                    >
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              placeholder="عنوان الإعلان"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل الإعلان</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="وصف تفصيلي للإعلان..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* العلامات */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>العلامات (مفصولة بفاصلة)</Text>
            <TextInput
              style={styles.textInput}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="مثال: محفظة، سوداء، بطاقات"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.helperText}>
              استخدم علامات لتسهيل البحث عن إعلانك
            </Text>
          </View>

          {/* بيانات إضافية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.color || ""}
              onChangeText={(value) =>
                updateFormData("metadata", {
                  ...formData.metadata,
                  color: value,
                })
              }
              placeholder="اللون (مثال: أسود، أحمر، أزرق)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.location || ""}
              onChangeText={(value) =>
                updateFormData("metadata", {
                  ...formData.metadata,
                  location: value,
                })
              }
              placeholder="الموقع (مثال: صنعاء، حدة)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.date || ""}
              onChangeText={(value) =>
                updateFormData("metadata", {
                  ...formData.metadata,
                  date: value,
                })
              }
              placeholder="التاريخ (مثال: 2024-01-15)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.contact || ""}
              onChangeText={(value) =>
                updateFormData("metadata", {
                  ...formData.metadata,
                  contact: value,
                })
              }
              placeholder="معلومات التواصل (رقم هاتف أو بريد إلكتروني)"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 12,
  },
  kindSelector: {
    flexDirection: "row",
    gap: 12,
  },
  kindOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  kindOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  kindOptionText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginLeft: 8,
  },
  kindOptionTextSelected: {
    color: COLORS.white,
    fontFamily: "Cairo-SemiBold",
  },
  statusSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statusOptionSelected: {
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  statusOptionTextSelected: {
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 4,
  },
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
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Cairo-SemiBold",
    marginLeft: 8,
  },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageWrap: { position: "relative" },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeImageBtn: { position: "absolute", top: -6, right: -6 },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: { fontSize: 10, color: COLORS.primary, marginTop: 4 },
  categoryScroll: { marginHorizontal: -4 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: { fontSize: 14, color: COLORS.text },
  categoryChipTextSelected: { color: COLORS.white },
});

export default MaaroufEditScreen;
