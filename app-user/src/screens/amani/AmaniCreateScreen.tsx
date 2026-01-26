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

import { RootStackParamList } from "@/types/navigation";
import { CreateAmaniPayload, AmaniLocation } from "@/types/types";
import { createAmani } from "@/api/amaniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AmaniCreate">;

const AmaniCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAmaniPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    origin: undefined,
    destination: undefined,
    metadata: {},
    status: 'draft',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الطلب');
      return;
    }

    if (!formData.origin) {
      Alert.alert('خطأ', 'يرجى تحديد موقع الانطلاق');
      return;
    }

    if (!formData.destination) {
      Alert.alert('خطأ', 'يرجى تحديد الوجهة');
      return;
    }

    if (!formData.ownerId) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      await createAmani(formData);
      Alert.alert(
        'نجح',
        'تم إنشاء طلب النقل بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في إنشاء طلب النقل:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء طلب النقل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateAmaniPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const setLocation = (type: 'origin' | 'destination', location: AmaniLocation) => {
    updateFormData(type, location);
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
        <Text style={styles.headerTitle}>طلب نقل جديد</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الطلب *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: نقل عائلي من الرياض إلى جدة"
              placeholderTextColor={COLORS.lightText}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل الطلب</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="وصف تفصيلي لطلب النقل..."
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          {/* موقع الانطلاق */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>موقع الانطلاق *</Text>
            {formData.origin ? (
              <View style={styles.locationDisplay}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.locationText}>{formData.origin.address}</Text>
                <TouchableOpacity
                  style={styles.editLocationButton}
                  onPress={() => {
                    // TODO: Navigate to location picker
                    Alert.alert('قريباً', 'سيتم إضافة ميزة اختيار الموقع قريباً');
                  }}
                >
                  <Ionicons name="pencil" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.locationPicker}
                onPress={() => {
                  // TODO: Navigate to location picker
                  Alert.alert('قريباً', 'سيتم إضافة ميزة اختيار الموقع قريباً');
                }}
              >
                <Ionicons name="location-outline" size={24} color={COLORS.primary} />
                <Text style={styles.locationPickerText}>اختر موقع الانطلاق</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* الوجهة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوجهة *</Text>
            {formData.destination ? (
              <View style={styles.locationDisplay}>
                <Ionicons name="navigate" size={20} color={COLORS.success} />
                <Text style={styles.locationText}>{formData.destination.address}</Text>
                <TouchableOpacity
                  style={styles.editLocationButton}
                  onPress={() => {
                    // TODO: Navigate to location picker
                    Alert.alert('قريباً', 'سيتم إضافة ميزة اختيار الموقع قريباً');
                  }}
                >
                  <Ionicons name="pencil" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.locationPicker}
                onPress={() => {
                  // TODO: Navigate to location picker
                  Alert.alert('قريباً', 'سيتم إضافة ميزة اختيار الموقع قريباً');
                }}
              >
                <Ionicons name="navigate-outline" size={24} color={COLORS.success} />
                <Text style={styles.locationPickerText}>اختر الوجهة</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* بيانات إضافية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.passengers?.toString() || ''}
              onChangeText={(value) => {
                const passengers = value ? parseInt(value) : undefined;
                updateFormData('metadata', {
                  ...formData.metadata,
                  passengers: passengers && passengers > 0 ? passengers : undefined
                });
              }}
              placeholder="عدد الركاب (مثال: 4)"
              placeholderTextColor={COLORS.lightText}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                updateFormData('metadata', {
                  ...formData.metadata,
                  luggage: !formData.metadata?.luggage
                });
              }}
            >
              <View style={[
                styles.checkbox,
                formData.metadata?.luggage && styles.checkboxChecked
              ]}>
                {formData.metadata?.luggage && (
                  <Ionicons name="checkmark" size={16} color={COLORS.background} />
                )}
              </View>
              <Text style={styles.checkboxText}>يوجد أمتعة</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.metadata?.specialRequests || ''}
              onChangeText={(value) =>
                updateFormData('metadata', {
                  ...formData.metadata,
                  specialRequests: value
                })
              }
              placeholder="طلبات خاصة (مثال: كرسي أطفال، مساعدات إضافية)"
              placeholderTextColor={COLORS.lightText}
              multiline
              numberOfLines={2}
              maxLength={200}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <>
              <Ionicons name="car" size={20} color={COLORS.background} />
              <Text style={styles.submitButtonText}>إنشاء طلب النقل</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
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
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
      borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    backgroundColor: COLORS.lightGray,
  },
  locationPickerText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  editLocationButton: {
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 16,
    color: COLORS.text,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AmaniCreateScreen;
