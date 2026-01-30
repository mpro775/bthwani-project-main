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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

import { RootStackParamList } from "@/types/navigation";
import { CreateEs3afniPayload, BLOOD_TYPES, Es3afniStatus } from "@/types/types";
import { createEs3afni } from "@/api/es3afniApi";
import { fetchUserProfile } from "@/api/userApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Es3afniCreate">;

const Es3afniCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateEs3afniPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    bloodType: undefined,
    location: undefined,
    metadata: {
      contact: '',
      unitsNeeded: undefined,
      urgency: 'عادي',
    },
    status: 'draft',
  });

  useEffect(() => {
    if (user?.uid) {
      setFormData((prev) => ({ ...prev, ownerId: user.uid }));
    }
  }, [user?.uid]);

  // عند العودة من شاشة الخريطة نقرأ الموقع المحفوظ
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const raw = await AsyncStorage.getItem("es3afni_location");
          if (!mounted || !raw) return;
          const payload = JSON.parse(raw) as { lat: number; lng: number; address?: string };
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: payload.lat,
              lng: payload.lng,
              address: payload.address || `إحداثيات: ${payload.lat.toFixed(5)}, ${payload.lng.toFixed(5)}`,
            },
          }));
          await AsyncStorage.removeItem("es3afni_location");
        } catch {
          // تجاهل
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان طلب التبرع');
      return;
    }

    let currentUserId = user?.uid;
    if (!currentUserId && isLoggedIn) {
      currentUserId = await AsyncStorage.getItem("userId") || undefined;
    }
    if (!currentUserId && isLoggedIn) {
      try {
        const profile = await fetchUserProfile();
        currentUserId = profile?.uid || profile?.id || profile?._id ? String(profile.uid || profile.id || profile._id) : undefined;
      } catch {
        // تجاهل
      }
    }
    if (!currentUserId) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      await createEs3afni({ ...formData, ownerId: currentUserId });
      Alert.alert(
        'نجح',
        'تم إنشاء طلب التبرع بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في إنشاء طلب التبرع:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء طلب التبرع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateEs3afniPayload, value: any) => {
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
          ...currentLocation,
          [field]: value,
        },
      };
    });
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
        <Text style={styles.headerTitle}>إنشاء طلب تبرع</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان طلب التبرع *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: حاجة عاجلة لفصيلة O+ في الرياض"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل طلب التبرع</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
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

          {/* الموقع — اختيار من الخريطة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            {formData.location?.address ? (
              <View style={styles.locationDisplay}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.locationDisplayText} numberOfLines={2}>
                  {formData.location.address}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationPlaceholder}>لم يتم اختيار موقع بعد</Text>
            )}
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() =>
                navigation.navigate("SelectLocation", {
                  storageKey: "es3afni_location",
                  title: "اختر موقع طلب التبرع",
                })
              }
            >
              <Ionicons name="map" size={22} color={COLORS.white} />
              <Text style={styles.mapButtonText}>
                {formData.location?.address ? "تغيير الموقع من الخريطة" : "اختر من الخريطة"}
              </Text>
            </TouchableOpacity>
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

          {/* حالة الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الطلب</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status ?? 'draft'}
                onValueChange={(value: Es3afniStatus) => updateFormData('status', value)}
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
                <Text style={styles.submitButtonText}>إنشاء طلب التبرع</Text>
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
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
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
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  locationDisplayText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginLeft: 8,
  },
  locationPlaceholder: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  mapButtonText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 8,
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
    color: COLORS.white,
    fontSize: 18,
    marginLeft: 8,
  },
});

export default Es3afniCreateScreen;
