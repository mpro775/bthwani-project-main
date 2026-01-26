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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

import { RootStackParamList } from "@/types/navigation";
import { CreateKenzPayload, KENZ_CATEGORIES, KenzCategory } from "@/types/types";
import { createKenz } from "@/api/kenzApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KenzCreate">;

const KenzCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateKenzPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    price: undefined,
    category: undefined,
    metadata: {
      contact: '',
      location: '',
      condition: 'جديد',
    },
    status: 'draft',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الإعلان');
      return;
    }

    if (!formData.ownerId) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      await createKenz(formData);
      Alert.alert(
        'نجح',
        'تم إنشاء الإعلان بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في إنشاء الإعلان:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الإعلان. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateKenzPayload, value: any) => {
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
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
              onChangeText={(value) => updateFormData('description', value)}
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
              placeholderTextColor={COLORS.textLight}
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
              value={formData.metadata?.location || ''}
              onChangeText={(value) => updateMetadata('location', value)}
              placeholder="مثال: الرياض، حي العليا"
              placeholderTextColor={COLORS.textLight}
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

          {/* حقول إضافية حسب الفئة */}
          {formData.category === 'إلكترونيات' && (
            <View style={styles.additionalFields}>
              <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.brand || ''}
                onChangeText={(value) => updateMetadata('brand', value)}
                placeholder="الماركة (مثال: Apple)"
                placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.model || ''}
                onChangeText={(value) => updateMetadata('model', value)}
                placeholder="الموديل (مثال: iPhone 14 Pro)"
                placeholderTextColor={COLORS.textLight}
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
                placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.year || ''}
                onChangeText={(value) => updateMetadata('year', value)}
                placeholder="سنة الصنع (مثال: 2020)"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.textInput}
                value={formData.metadata?.mileage || ''}
                onChangeText={(value) => updateMetadata('mileage', value)}
                placeholder="عدد الكيلومترات"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
              />
            </View>
          )}

          {/* زر الإرسال */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default KenzCreateScreen;
