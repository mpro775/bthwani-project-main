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

import { RootStackParamList } from "@/types/navigation";
import { AmaniItem, UpdateAmaniPayload, AmaniLocation } from "@/types/types";
import { getAmaniDetails, updateAmani } from "@/api/amaniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "AmaniEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AmaniEdit">;

const AmaniEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<AmaniItem | null>(null);

  const [formData, setFormData] = useState<UpdateAmaniPayload>({
    title: '',
    description: '',
    origin: undefined,
    destination: undefined,
    metadata: {},
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getAmaniDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || '',
        origin: itemData.origin,
        destination: itemData.destination,
        metadata: itemData.metadata || {},
        status: itemData.status,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات طلب النقل:", error);
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
      Alert.alert('خطأ', 'يرجى إدخال عنوان الطلب');
      return;
    }

    setSaving(true);
    try {
      await updateAmani(itemId, formData);
      Alert.alert(
        'نجح',
        'تم تحديث طلب النقل بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في تحديث طلب النقل:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث طلب النقل. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateAmaniPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const setLocation = (type: 'origin' | 'destination', location: AmaniLocation) => {
    updateFormData(type, location);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return COLORS.gray;
      case 'pending': return COLORS.orangeDark;
      case 'confirmed': return COLORS.primary;
      case 'in_progress': return COLORS.info;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const selectStatus = (status: string) => {
    updateFormData('status', status);
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
        <Text style={styles.errorText}>ليس لديك صلاحية تعديل طلب النقل</Text>
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
        <Text style={styles.headerTitle}>تعديل طلب النقل</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* حالة الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الطلب</Text>
            <View style={styles.statusSelector}>
              {['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && [
                      styles.statusOptionSelected,
                      { borderColor: getStatusColor(status) }
                    ],
                  ]}
                  onPress={() => selectStatus(status)}
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

          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الطلب *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="عنوان الطلب"
              placeholderTextColor={COLORS.textLight}
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
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          {/* موقع الانطلاق */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>موقع الانطلاق</Text>
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
            <Text style={styles.sectionTitle}>الوجهة</Text>
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
              placeholder="عدد الركاب"
              placeholderTextColor={COLORS.textLight}
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
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
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
              placeholder="طلبات خاصة"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={2}
              maxLength={200}
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
    marginTop: 16,
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
    marginBottom: 12,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '500',
    color: COLORS.text,
  },
  statusOptionTextSelected: {
    fontWeight: '600',
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
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AmaniEditScreen;
