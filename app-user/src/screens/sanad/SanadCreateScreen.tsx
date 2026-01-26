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
import { CreateSanadPayload, SanadKind } from "@/types/types";
import { createSanad } from "@/api/sanadApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SanadCreate">;

const SanadCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateSanadPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    kind: undefined,
    metadata: {},
    status: 'draft',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الطلب');
      return;
    }

    if (!formData.ownerId) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      await createSanad(formData);
      Alert.alert(
        'نجح',
        'تم إنشاء الطلب بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في إنشاء الطلب:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateSanadPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectKind = (kind: SanadKind) => {
    updateFormData('kind', kind);
  };

  const getKindIcon = (kind: SanadKind) => {
    switch (kind) {
      case 'specialist': return 'briefcase-outline';
      case 'emergency': return 'warning-outline';
      case 'charity': return 'heart-outline';
      default: return 'help-circle-outline';
    }
  };

  const getKindDescription = (kind: SanadKind) => {
    switch (kind) {
      case 'specialist': return 'طلب خدمة متخصصة أو استشارة';
      case 'emergency': return 'حالة طارئة تحتاج مساعدة فورية';
      case 'charity': return 'طلب مساعدة خيرية أو تبرع';
      default: return '';
    }
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
        <Text style={styles.headerTitle}>إضافة طلب جديد</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* نوع الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع الطلب *</Text>
            <View style={styles.kindSelector}>
              {(['specialist', 'emergency', 'charity'] as SanadKind[]).map((kind) => (
                <TouchableOpacity
                  key={kind}
                  style={[
                    styles.kindOption,
                    formData.kind === kind && styles.kindOptionSelected,
                  ]}
                  onPress={() => selectKind(kind)}
                >
                  <Ionicons
                    name={getKindIcon(kind) as any}
                    size={24}
                    color={formData.kind === kind ? COLORS.white : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.kindOptionText,
                      formData.kind === kind && styles.kindOptionTextSelected,
                    ]}
                  >
                    {kind === 'specialist' ? 'متخصص' :
                     kind === 'emergency' ? 'فزعة' : 'خيري'}
                  </Text>
                  <Text
                    style={[
                      styles.kindOptionDesc,
                      formData.kind === kind && styles.kindOptionDescSelected,
                    ]}
                  >
                    {getKindDescription(kind)}
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
              placeholder="مثال: طلب فزعة لإسعاف عاجل"
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
              placeholder="وصف تفصيلي لطلبك..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* بيانات إضافية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.location || ''}
              onChangeText={(value) =>
                updateFormData('metadata', { ...formData.metadata, location: value })
              }
              placeholder="الموقع (مثال: الرياض، النرجس)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.contact || ''}
              onChangeText={(value) =>
                updateFormData('metadata', { ...formData.metadata, contact: value })
              }
              placeholder="معلومات التواصل (رقم هاتف أو بريد إلكتروني)"
              placeholderTextColor={COLORS.textLight}
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
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>إنشاء الطلب</Text>
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
  kindSelector: {
    gap: 12,
  },
  kindOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
    marginRight: 8,
  },
  kindOptionTextSelected: {
    color: COLORS.white,
  },
  kindOptionDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
    lineHeight: 16,
  },
  kindOptionDescSelected: {
    color: COLORS.white,
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

export default SanadCreateScreen;
