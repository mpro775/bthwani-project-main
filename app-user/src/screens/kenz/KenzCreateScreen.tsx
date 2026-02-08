import React, { useState, useEffect } from "react";
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
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/types/navigation";
import {
  CreateKenzPayload,
  KENZ_CATEGORIES,
  KENZ_YEMEN_CITIES,
  KENZ_CURRENCIES,
  KenzCategory,
} from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createKenz } from "@/api/kenzApi";
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import { uploadKenzImageToBunny } from "@/utils/uploadToBunny";
import COLORS from "@/constants/colors";

const MAX_IMAGES = 8;

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KenzCreate"
>;

const KenzCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateKenzPayload>({
    ownerId: user?.uid || "",
    title: "",
    description: "",
    price: undefined,
    category: undefined,
    metadata: {
      contact: "",
      location: "",
      condition: "جديد",
    },
    status: "draft",
    city: undefined,
    keywords: undefined,
    currency: "ريال يمني",
    quantity: 1,
    postedOnBehalfOfPhone: "",
    deliveryOption: undefined as "meetup" | "delivery" | "both" | undefined,
    deliveryFee: undefined as number | undefined,
    acceptsEscrow: false,
    isAuction: false,
    auctionEndAt: undefined as string | undefined,
    startingPrice: undefined as number | undefined,
  });
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [keywordsText, setKeywordsText] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // مزامنة ownerId عند توفر المستخدم (قد يُحمّل لاحقاً بعد أول render)
  useEffect(() => {
    if (user?.uid) {
      setFormData((prev) => ({ ...prev, ownerId: user.uid }));
    }
  }, [user?.uid]);

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الإعلان");
      return;
    }

    // مصدر الهوية: من AuthContext أولاً، ثم التخزين، ثم جلب البروفايل من API
    let currentUserId = user?.uid;
    if (!currentUserId && isLoggedIn) {
      const storedUserId = await AsyncStorage.getItem("userId");
      currentUserId = storedUserId || undefined;
    }
    if (!currentUserId && isLoggedIn) {
      try {
        const profile = await fetchUserProfile();
        currentUserId = profile?.uid || profile?.id || profile?._id;
        if (currentUserId) currentUserId = String(currentUserId);
      } catch (_e) {
        // تجاهل — سنعرض رسالة تسجيل الدخول أدناه إن بقي فارغاً
      }
    }
    if (!currentUserId) {
      Alert.alert("خطأ", "يجب تسجيل الدخول أولاً");
      return;
    }

    const qty = formData.quantity ?? 1;
    if (qty < 1) {
      Alert.alert("خطأ", "الكمية يجب أن تكون 1 على الأقل");
      return;
    }
    if (formData.isAuction && !formData.auctionEndAt) {
      Alert.alert("خطأ", "يرجى تحديد تاريخ انتهاء المزاد");
      return;
    }
    if (formData.isAuction && (!formData.startingPrice || formData.startingPrice < 0)) {
      Alert.alert("خطأ", "يرجى إدخال السعر الابتدائي للمزاد");
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageUris.length > 0) {
        setUploadingImages(true);
        for (const uri of imageUris) {
          const url = await uploadKenzImageToBunny(uri);
          imageUrls.push(url);
        }
        setUploadingImages(false);
      }

      const keywords = keywordsText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: CreateKenzPayload = {
        ...formData,
        ownerId: currentUserId,
        images: imageUrls.length ? imageUrls : undefined,
        keywords: keywords.length ? keywords : undefined,
        quantity: qty,
        postedOnBehalfOfPhone:
          formData.postedOnBehalfOfPhone?.trim() || undefined,
        deliveryOption: formData.deliveryOption,
        deliveryFee:
          formData.deliveryOption === "delivery" ||
          formData.deliveryOption === "both"
            ? formData.deliveryFee
            : undefined,
        acceptsEscrow: formData.acceptsEscrow,
        isAuction: formData.isAuction || undefined,
        auctionEndAt: formData.isAuction && formData.auctionEndAt
          ? new Date(formData.auctionEndAt).toISOString()
          : undefined,
        startingPrice: formData.isAuction ? formData.startingPrice : undefined,
        price: formData.isAuction ? formData.startingPrice : formData.price,
      };
      await createKenz(payload);
      Alert.alert("نجح", "تم إنشاء الإعلان بنجاح", [
        { text: "موافق", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("خطأ في إنشاء الإعلان:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء إنشاء الإعلان. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const updateFormData = (field: keyof CreateKenzPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة إعلان جديد</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              placeholder="مثال: iPhone 14 Pro مستعمل بحالة ممتازة"
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
              placeholder="وصف تفصيلي للمنتج أو الخدمة..."
              placeholderTextColor={COLORS.textLight}
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
                onValueChange={(value) => updateFormData("category", value)}
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
              onChangeText={(value) => {
                const numValue = value ? parseFloat(value) : undefined;
                updateFormData("price", numValue);
              }}
              placeholder="مثال: 3500"
              placeholderTextColor={COLORS.textLight}
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
              value={formData.metadata?.contact || ""}
              onChangeText={(value) => updateMetadata("contact", value)}
              placeholder="مثال: +9677XXXXXXXX"
              placeholderTextColor={COLORS.textLight}
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
              onChangeText={(value) => updateMetadata("location", value)}
              placeholder="مثال: صنعاء، حدة"
              placeholderTextColor={COLORS.textLight}
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
                selectedValue={formData.metadata?.condition || "جديد"}
                onValueChange={(value) => updateMetadata("condition", value)}
                style={styles.picker}
              >
                <Picker.Item label="جديد" value="جديد" />
                <Picker.Item label="مستعمل - ممتاز" value="مستعمل - ممتاز" />
                <Picker.Item label="مستعمل - جيد" value="مستعمل - جيد" />
                <Picker.Item label="مستعمل - مقبول" value="مستعمل - مقبول" />
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
                updateFormData(
                  "quantity",
                  Number.isFinite(n) && n >= 1 ? n : 1
                );
              }}
              placeholder="1"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
          </View>

          {/* طريقة التسليم */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>طريقة التسليم</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.deliveryOption}
                onValueChange={(value) =>
                  updateFormData("deliveryOption", value)
                }
                style={styles.picker}
              >
                <Picker.Item label="اختياري" value={undefined} />
                <Picker.Item label="لقاء" value="meetup" />
                <Picker.Item label="توصيل" value="delivery" />
                <Picker.Item label="لقاء وتوصيل" value="both" />
              </Picker>
            </View>
            {(formData.deliveryOption === "delivery" ||
              formData.deliveryOption === "both") && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                  رسوم التوصيل
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.deliveryFee?.toString() ?? ""}
                  onChangeText={(v) =>
                    updateFormData("deliveryFee", v ? parseFloat(v) : undefined)
                  }
                  placeholder="مثال: 500"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                />
              </>
            )}
            <View style={[styles.section, { marginTop: 12 }]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>يقبل الدفع بالإيكرو</Text>
                <Switch
                  value={formData.acceptsEscrow}
                  onValueChange={(v) => updateFormData("acceptsEscrow", v)}
                />
              </View>
              <Text style={styles.helperText}>
                حجز المبلغ حتى تأكيد الاستلام
              </Text>
            </View>
            <View style={[styles.section, { marginTop: 12 }]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>إعلان مزاد</Text>
                <Switch
                  value={formData.isAuction}
                  onValueChange={(v) => updateFormData("isAuction", v)}
                />
              </View>
              <Text style={styles.helperText}>
                مزايدة على السعر — يُحدد تاريخ انتهاء وسعر ابتدائي
              </Text>
            </View>
            {formData.isAuction && (
              <>
                <View style={[styles.section, { marginTop: 12 }]}>
                  <Text style={styles.sectionTitle}>السعر الابتدائي *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.startingPrice?.toString() ?? ""}
                    onChangeText={(v) =>
                      updateFormData("startingPrice", v ? parseFloat(v) : undefined)
                    }
                    placeholder="مثال: 1000"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.section, { marginTop: 12 }]}>
                  <Text style={styles.sectionTitle}>تاريخ انتهاء المزاد *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.auctionEndAt ?? ""}
                    onChangeText={(v) => updateFormData("auctionEndAt", v || undefined)}
                    placeholder="2025-03-15T20:00:00"
                    placeholderTextColor={COLORS.textLight}
                  />
                  <Text style={styles.helperText}>
                    تنسيق: YYYY-MM-DDTHH:mm:ss
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* نشر بالنيابة عن */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              نشر بالنيابة عن (رقم الهاتف)
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.postedOnBehalfOfPhone ?? ""}
              onChangeText={(value) =>
                updateFormData("postedOnBehalfOfPhone", value)
              }
              placeholder="اختياري: أدخل رقم هاتف من تنشر الإعلان باسمه"
              placeholderTextColor={COLORS.textLight}
              maxLength={20}
            />
            <Text style={styles.helperText}>
              اتركه فارغاً إذا كنت تنشر الإعلان باسمك
            </Text>
          </View>

          {/* الكلمات المفتاحية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>كلمات مفتاحية</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={keywordsText}
              onChangeText={setKeywordsText}
              placeholder="مفصولة بفواصل، مثال: جوال، أيفون، مستعمل"
              placeholderTextColor={COLORS.textLight}
              multiline
            />
          </View>

          {/* صور الإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              صور الإعلان (حد أقصى {MAX_IMAGES})
            </Text>
            <View style={styles.imagesRow}>
              {imageUris.map((uri, i) => (
                <View key={i} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(i)}
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

          {/* حقول إضافية حسب الفئة */}
          {formData.category === "إلكترونيات" && (
            <View style={styles.additionalFields}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.brand || ""}
                onChangeText={(value) => updateMetadata("brand", value)}
                placeholder="الماركة (مثال: Apple)"
                placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.model || ""}
                onChangeText={(value) => updateMetadata("model", value)}
                placeholder="الموديل (مثال: iPhone 14 Pro)"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          )}

          {formData.category === "سيارات" && (
            <View style={styles.additionalFields}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.brand || ""}
                onChangeText={(value) => updateMetadata("brand", value)}
                placeholder="الماركة (مثال: Toyota)"
                placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.year || ""}
                onChangeText={(value) => updateMetadata("year", value)}
                placeholder="سنة الصنع (مثال: 2020)"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.mileage || ""}
                onChangeText={(value) => updateMetadata("mileage", value)}
                placeholder="عدد الكيلومترات"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
              />
            </View>
          )}

          {/* زر الإرسال */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || uploadingImages) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || uploadingImages}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>إضافة الإعلان</Text>
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
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    color: COLORS.white,
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

export default KenzCreateScreen;
