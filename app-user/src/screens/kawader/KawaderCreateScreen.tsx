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
import { CreateKawaderPayload, KawaderStatus, WORK_SCOPES } from "@/types/types";
import { createKawader } from "@/api/kawaderApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KawaderCreate">;

const KawaderCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');

  const [formData, setFormData] = useState<CreateKawaderPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    scope: '',
    budget: undefined,
    metadata: {
      experience: '',
      skills: [],
      location: '',
      remote: false,
    },
    status: 'draft',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان العرض الوظيفي');
      return;
    }

    if (!formData.ownerId) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      const processedSkills = skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const payload: CreateKawaderPayload = {
        ...formData,
        metadata: {
          ...formData.metadata,
          skills: processedSkills,
        },
      };

      await createKawader(payload);
      Alert.alert(
        'نجح',
        'تم إنشاء العرض الوظيفي بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في إنشاء العرض الوظيفي:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء العرض الوظيفي. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateKawaderPayload, value: any) => {
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
        <Text style={styles.headerTitle}>إضافة عرض وظيفي جديد</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان العرض الوظيفي *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: مطور Full Stack مطلوب لمشروع تقني"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
            />
          </View>

          {/* الوصف */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل العرض</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="وصف تفصيلي للعرض الوظيفي أو الخدمة المهنية..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* النطاق */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نطاق العمل</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scopeScroll}>
              <View style={styles.scopeContainer}>
                {WORK_SCOPES.map((scope) => (
                  <TouchableOpacity
                    key={scope}
                    style={[
                      styles.scopeOption,
                      formData.scope === scope && styles.scopeOptionSelected,
                    ]}
                    onPress={() => updateFormData('scope', scope)}
                  >
                    <Text
                      style={[
                        styles.scopeOptionText,
                        formData.scope === scope && styles.scopeOptionTextSelected,
                      ]}
                    >
                      {scope}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* الميزانية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الميزانية (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.budget?.toString() || ''}
              onChangeText={(value) => {
                const numValue = value ? parseFloat(value) : undefined;
                updateFormData('budget', numValue);
              }}
              placeholder="مثال: 15000"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </View>

          {/* بيانات إضافية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.experience || ''}
              onChangeText={(value) => updateMetadata('experience', value)}
              placeholder="الخبرة المطلوبة (مثال: 3+ سنوات)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={skillsInput}
              onChangeText={setSkillsInput}
              placeholder="المهارات المطلوبة (مفصولة بفاصلة)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.location || ''}
              onChangeText={(value) => updateMetadata('location', value)}
              placeholder="الموقع (مثال: الرياض، جدة)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.contact || ''}
              onChangeText={(value) => updateMetadata('contact', value)}
              placeholder="رقم التواصل (اختياري)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => updateMetadata('remote', !formData.metadata?.remote)}
            >
              <View style={[
                styles.checkbox,
                formData.metadata?.remote && styles.checkboxChecked
              ]}>
                {formData.metadata?.remote && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>متاح العمل عن بعد</Text>
            </TouchableOpacity>
          </View>

          {/* الحالة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الحالة الأولية</Text>
            <View style={styles.statusSelector}>
              {[
                { key: 'draft', label: 'مسودة' },
                { key: 'pending', label: 'في الانتظار' },
              ].map((status) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.statusOption,
                    formData.status === status.key && styles.statusOptionSelected,
                  ]}
                  onPress={() => updateFormData('status', status.key as KawaderStatus)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      formData.status === status.key && styles.statusOptionTextSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="briefcase" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>إنشاء العرض الوظيفي</Text>
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
    height: 100,
    textAlignVertical: 'top',
  },
  scopeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scopeContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  scopeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  scopeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  scopeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  scopeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  statusOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
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

export default KawaderCreateScreen;
