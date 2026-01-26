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
import { Es3afniItem, UpdateEs3afniPayload, BLOOD_TYPES, Es3afniStatus } from "@/types/types";
import { getEs3afniDetails, updateEs3afni } from "@/api/es3afniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "Es3afniEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Es3afniEdit">;

const Es3afniEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<Es3afniItem | null>(null);

  const [formData, setFormData] = useState<UpdateEs3afniPayload>({
    title: '',
    description: '',
    bloodType: undefined,
    location: undefined,
    metadata: {
      contact: '',
      unitsNeeded: undefined,
      urgency: 'عادي',
    },
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getEs3afniDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || '',
        bloodType: itemData.bloodType,
        location: itemData.location,
        metadata: itemData.metadata || {
          contact: '',
          unitsNeeded: undefined,
          urgency: 'عادي',
        },
        status: itemData.status,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات البلاغ:", error);
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
      Alert.alert('خطأ', 'يرجى إدخال عنوان البلاغ');
      return;
    }

    setSaving(true);
    try {
      await updateEs3afni(itemId, formData);
      Alert.alert(
        'نجح',
        'تم تحديث البلاغ بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في تحديث البلاغ:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateEs3afniPayload, value: any) => {
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

  const updateLocation = (field: string, value: any) => {
    setFormData(prev => {
      const currentLocation = prev.location || { lat: 0, lng: 0, address: '' };
      return {
        ...prev,
        location: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address,
          [field]: value,
        },
      };
    });
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
        <Text style={styles.errorText}>لا تملك صلاحية تعديل هذا البلاغ</Text>
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
        <Text style={styles.headerTitle}>تعديل البلاغ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان البلاغ *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title || ''}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: حاجة عاجلة لفصيلة O+ في الرياض"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل البلاغ</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description || ''}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="وصف تفصيلي للحاجة والحالة الطبية..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* فصيلة الدم */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فصيلة الدم المطلوبة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bloodType}
                onValueChange={(value) => updateFormData('bloodType', value)}
                style={styles.picker}
              >
                <Picker.Item label="اختر فصيلة الدم" value={undefined} />
                {BLOOD_TYPES.map((bloodType) => (
                  <Picker.Item
                    key={bloodType}
                    label={`${bloodType} ${['O-', 'AB-', 'B-'].includes(bloodType) ? '(نادرة)' : ''}`}
                    value={bloodType}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* الموقع */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location?.address || ''}
              onChangeText={(value) => updateLocation('address', value)}
              placeholder="مثال: مستشفى الملك فيصل التخصصي، الرياض"
              placeholderTextColor={COLORS.textLight}
              maxLength={200}
            />
            <View style={styles.coordinatesContainer}>
              <TextInput
                style={[styles.textInput, styles.coordinateInput]}
                value={formData.location?.lat?.toString() || ''}
                onChangeText={(value) => {
                  const numValue = value ? parseFloat(value) : undefined;
                  updateLocation('lat', numValue);
                }}
                placeholder="خط العرض"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.textInput, styles.coordinateInput]}
                value={formData.location?.lng?.toString() || ''}
                onChangeText={(value) => {
                  const numValue = value ? parseFloat(value) : undefined;
                  updateLocation('lng', numValue);
                }}
                placeholder="خط الطول"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
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
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>

          {/* عدد الوحدات المطلوبة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عدد الوحدات المطلوبة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.metadata?.unitsNeeded?.toString() || ''}
              onChangeText={(value) => {
                const numValue = value ? parseInt(value) : undefined;
                updateMetadata('unitsNeeded', numValue);
              }}
              placeholder="مثال: 3"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
          </View>

          {/* درجة الاستعجال */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>درجة الاستعجال</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.metadata?.urgency || 'عادي'}
                onValueChange={(value) => updateMetadata('urgency', value)}
                style={styles.picker}
              >
                <Picker.Item label="عادي" value="عادي" />
                <Picker.Item label="عاجل" value="عاجل" />
                <Picker.Item label="طارئ جداً" value="طارئ جداً" />
              </Picker>
            </View>
          </View>

          {/* الحالة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة البلاغ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => updateFormData('status', value)}
                style={styles.picker}
              >
                <Picker.Item label="مسودة" value="draft" />
                <Picker.Item label="في الانتظار" value="pending" />
                <Picker.Item label="مؤكد" value="confirmed" />
                <Picker.Item label="مكتمل" value="completed" />
                <Picker.Item label="ملغي" value="cancelled" />
              </Picker>
            </View>
          </View>

          {/* زر الحفظ */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
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
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
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
    height: 80,
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
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  coordinateInput: {
    flex: 1,
    marginHorizontal: 4,
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

export default Es3afniEditScreen;
