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
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

import { RootStackParamList } from "@/types/navigation";
import { KenzItem, UpdateKenzPayload, KENZ_CATEGORIES, KenzStatus } from "@/types/types";
import { getKenzDetails, updateKenz } from "@/api/kenzApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "KenzEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KenzEdit">;

const KenzEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<KenzItem | null>(null);

  const [formData, setFormData] = useState<UpdateKenzPayload>({
    title: '',
    description: '',
    price: undefined,
    category: undefined,
    metadata: {
      contact: '',
      location: '',
      condition: 'جديد',
    },
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getKenzDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || '',
        price: itemData.price,
        category: itemData.category,
        metadata: itemData.metadata || {
          contact: '',
          location: '',
          condition: 'جديد',
        },
        status: itemData.status,
      });
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

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الإعلان');
      return;
    }

    setSaving(true);
    try {
      await updateKenz(itemId, formData);
      Alert.alert(
        'نجح',
        'تم تحديث الإعلان بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في تحديث الإعلان:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateKenzPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const isOwner = user && originalItem && originalItem.ownerId === user.uid;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  if (!originalItem || !isOwner) {
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
            <Text style={styles.sectionTitle}>السعر (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.price?.toString() || ''}
              onChangeText={(value) => {
                const numValue = value ? parseFloat(value) : undefined;
                updateFormData('price', numValue);
              }}
              placeholder="مثال: 3500"
              placeholderTextColor={COLORS.lightText}
              keyboardType="decimal-pad"
            />
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
              value={formData.metadata?.location || ''}
              onChangeText={(value) => updateMetadata('location', value)}
              placeholder="مثال: الرياض، حي العليا"
              placeholderTextColor={COLORS.lightText}
              maxLength={100}
            />
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
                onValueChange={(value) => updateFormData('status', value)}
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
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
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
});

export default KenzEditScreen;
