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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  KenzItem,
  UpdateKenzPayload,
  KENZ_CATEGORIES,
  KENZ_YEMEN_CITIES,
  KENZ_CURRENCIES,
  KenzStatus,
} from "@/types/types";
import { getKenzDetails, updateKenz } from "@/api/kenzApi";
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import { uploadKenzImageToBunny } from "@/utils/uploadToBunny";
import COLORS from "@/constants/colors";

const MAX_IMAGES = 8;

type RouteProps = RouteProp<RootStackParamList, "KenzEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KenzEdit">;

const KenzEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<KenzItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // استنتاج هوية المستخدم الحالي (للتحقق من صلاحية التعديل)
  useEffect(() => {
    (async () => {
      let uid = user?.uid ?? null;
      if (!uid && isLoggedIn) {
        uid = await AsyncStorage.getItem("userId");
        if (!uid) {
          try {
            const profile = await fetchUserProfile();
            uid = profile?.uid || profile?.id || profile?._id ? String(profile.uid || profile.id || profile._id) : null;
          } catch {
            // تجاهل
          }
        }
      }
      setCurrentUserId(uid);
    })();
  }, [user?.uid, isLoggedIn]);

  const [formData, setFormData] = useState<UpdateKenzPayload>({
    title: "",
    description: "",
    price: undefined,
    category: undefined,
    metadata: { contact: "", location: "", condition: "جديد" },
    status: undefined,
    city: undefined,
    keywords: undefined,
    currency: "ريال يمني",
    quantity: 1,
    images: undefined,
  });
  const [keywordsText, setKeywordsText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getKenzDetails(itemId);
      setOriginalItem(itemData);

      const meta = itemData.metadata || {
        contact: "",
        location: "",
        condition: "جديد",
      };
      setFormData({
        title: itemData.title,
        description: itemData.description || "",
        price: itemData.price,
        category: itemData.category,
        metadata: meta,
        status: itemData.status,
        city: itemData.city,
        keywords: itemData.keywords,
        currency: itemData.currency ?? "ريال يمني",
        quantity: itemData.quantity ?? 1,
        images: itemData.images,
      });
      setKeywordsText(
        (itemData.keywords ?? []).join("، ")
      );
      setImageUrls(itemData.images ?? []);
      setNewImageUris([]);
    } catch (error) {
      console.error("خطأ في تحميل بيانات الإعلان:", error);
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
    const current = imageUrls.length + newImageUris.length;
    if (current >= MAX_IMAGES) {
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
      const combined = [...newImageUris, ...added];
      const cap = MAX_IMAGES - imageUrls.length;
      setNewImageUris(combined.slice(0, cap));
    } catch (e) {
      Alert.alert("خطأ", "فشل اختيار الصور");
    }
  };

  const removeExistingImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الإعلان");
      return;
    }

    const qty = formData.quantity ?? 1;
    if (qty < 1) {
      Alert.alert("خطأ", "الكمية يجب أن تكون 1 على الأقل");
      return;
    }

    setSaving(true);
    try {
      let newUrls: string[] = [];
      if (newImageUris.length > 0) {
        setUploadingImages(true);
        for (const uri of newImageUris) {
          const url = await uploadKenzImageToBunny(uri);
          newUrls.push(url);
        }
        setUploadingImages(false);
      }

      const keywords = keywordsText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: UpdateKenzPayload = {
        ...formData,
        images: [...imageUrls, ...newUrls],
        keywords: keywords.length ? keywords : undefined,
        quantity: qty,
      };
      await updateKenz(itemId, payload);
      Alert.alert("نجح", "تم تحديث الإعلان بنجاح", [
        { text: "موافق", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("خطأ في تحديث الإعلان:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const updateFormData = (field: keyof UpdateKenzPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const ownerIdStr =
    originalItem &&
    (typeof originalItem.ownerId === "object" && (originalItem.ownerId as any)?._id
      ? String((originalItem.ownerId as any)._id)
      : String(originalItem.ownerId || ""));
  const isOwner = !!(currentUserId && originalItem && ownerIdStr === currentUserId);
  const stillResolvingUser = isLoggedIn && currentUserId === null && !!originalItem;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  if (!originalItem) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>لم يتم العثور على الإعلان</Text>
      </View>
    );
  }

  if (stillResolvingUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري التحقق من الصلاحية...</Text>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>لا تملك صلاحية تعديل هذا الإعلان</Text>
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title || ''}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: iPhone 14 Pro مستعمل بحالة ممتازة"
              placeholderTextColor={COLORS.lightText}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل الإعلان</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description || ''}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="وصف تفصيلي للمنتج أو الخدمة..."
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>

          {/* الفئة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الفئة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
                style={styles.picker}
              >
                <Picker.Item label="اختر الفئة" value={undefined} />
                {KENZ_CATEGORIES.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* السعر */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>السعر</Text>
            <TextInput
              style={styles.textInput}
              value={formData.price?.toString() || ""}
              onChangeText={(v) => {
                const n = v ? parseFloat(v) : undefined;
                updateFormData("price", n);
              }}
              placeholder="مثال: 3500"
              placeholderTextColor={COLORS.lightText}
              keyboardType="decimal-pad"
            />
          </View>

          {/* العملة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>العملة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.currency ?? "ريال يمني"}
                onValueChange={(v) => updateFormData("currency", v)}
                style={styles.picker}
              >
                {KENZ_CURRENCIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          {/* رقم التواصل */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>رقم التواصل</Text>
            <TextInput
              style={styles.textInput}
              value={formData.metadata?.contact || ''}
              onChangeText={(value) => updateMetadata('contact', value)}
              placeholder="مثال: +9665XXXXXXXX"
              placeholderTextColor={COLORS.lightText}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>

          {/* الموقع */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <TextInput
              style={styles.textInput}
              value={formData.metadata?.location || ""}
              onChangeText={(v) => updateMetadata("location", v)}
              placeholder="مثال: الرياض، حي العليا"
              placeholderTextColor={COLORS.lightText}
              maxLength={100}
            />
          </View>

          {/* المدينة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المدينة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.city}
                onValueChange={(v) => updateFormData("city", v)}
                style={styles.picker}
              >
                <Picker.Item label="اختر المدينة" value={undefined} />
                {KENZ_YEMEN_CITIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          {/* الحالة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة المنتج</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.metadata?.condition || 'جديد'}
                onValueChange={(value) => updateMetadata('condition', value)}
                style={styles.picker}
              >
                <Picker.Item label="جديد" value="جديد" />
                <Picker.Item label="مستعمل - ممتاز" value="مستعمل - ممتاز" />
                <Picker.Item label="مستعمل - جيد" value="مستعمل - جيد" />
                <Picker.Item label="مستعمل - مقبول" value="مستعمل - مقبول" />
              </Picker>
            </View>
          </View>

          {/* الحالة العامة للإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الإعلان</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(v) => updateFormData("status", v)}
                style={styles.picker}
              >
                <Picker.Item label="مسودة" value="draft" />
                <Picker.Item label="في الانتظار" value="pending" />
                <Picker.Item label="متاح" value="confirmed" />
                <Picker.Item label="مباع" value="completed" />
                <Picker.Item label="ملغي" value="cancelled" />
              </Picker>
            </View>
          </View>

          {/* الكمية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الكمية</Text>
            <TextInput
              style={styles.textInput}
              value={String(formData.quantity ?? 1)}
              onChangeText={(v) => {
                const n = v ? parseInt(v, 10) : NaN;
                updateFormData("quantity", Number.isFinite(n) && n >= 1 ? n : 1);
              }}
              placeholder="1"
              placeholderTextColor={COLORS.lightText}
              keyboardType="number-pad"
            />
          </View>

          {/* الكلمات المفتاحية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>كلمات مفتاحية</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={keywordsText}
              onChangeText={setKeywordsText}
              placeholder="مفصولة بفواصل، مثال: جوال، أيفون، مستعمل"
              placeholderTextColor={COLORS.lightText}
              multiline
            />
          </View>

          {/* صور الإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صور الإعلان (حد أقصى {MAX_IMAGES})</Text>
            <View style={styles.imagesRow}>
              {imageUrls.map((url, i) => (
                <View key={`url-${i}`} style={styles.imageWrap}>
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
              {imageUrls.length + newImageUris.length < MAX_IMAGES && (
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

          {/* حقول إضافية حسب الفئة */}
          {formData.category === 'إلكترونيات' && (
            <View style={styles.additionalFields}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.brand || ''}
                onChangeText={(value) => updateMetadata('brand', value)}
                placeholder="الماركة (مثال: Apple)"
                placeholderTextColor={COLORS.lightText}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.model || ''}
                onChangeText={(value) => updateMetadata('model', value)}
                placeholder="الموديل (مثال: iPhone 14 Pro)"
                placeholderTextColor={COLORS.lightText}
              />
            </View>
          )}

          {formData.category === 'سيارات' && (
            <View style={styles.additionalFields}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.brand || ''}
                onChangeText={(value) => updateMetadata('brand', value)}
                placeholder="الماركة (مثال: Toyota)"
                placeholderTextColor={COLORS.lightText}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.year || ''}
                onChangeText={(value) => updateMetadata('year', value)}
                placeholder="سنة الصنع (مثال: 2020)"
                placeholderTextColor={COLORS.lightText}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.mileage || ''}
                onChangeText={(value) => updateMetadata('mileage', value)}
                placeholder="عدد الكيلومترات"
                  placeholderTextColor={COLORS.lightText}
                keyboardType="number-pad"
              />
            </View>
          )}

          {/* زر الحفظ */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (saving || uploadingImages) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={saving || uploadingImages}
          >
            {saving || uploadingImages ? (
              <ActivityIndicator size="small" color={COLORS.lightText} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.lightText} />
                <Text style={styles.submitButtonText}>حفظ التغييرات</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.danger,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: 'center',
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
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  additionalFields: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
    fontSize: 18,
    marginLeft: 8,
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageWrap: {
    position: "relative",
    width: 80,
    height: 80,
    marginRight: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addImageText: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  uploadingText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
  },
});

export default KenzEditScreen;
