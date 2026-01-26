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
import { CreateMaaroufPayload, MaaroufKind } from "@/types/types";
import { createMaarouf } from "@/api/maaroufApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MaaroufCreate">;

const MaaroufCreateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateMaaroufPayload>({
    ownerId: user?.uid || '',
    title: '',
    description: '',
    kind: undefined,
    tags: [],
    metadata: {},
    status: 'draft',
  });

  const [tagsInput, setTagsInput] = useState('');

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
      const processedTags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload: CreateMaaroufPayload = {
        ...formData,
        tags: processedTags,
      };

      await createMaarouf(payload);
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

  const updateFormData = (field: keyof CreateMaaroufPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectKind = (kind: MaaroufKind) => {
    updateFormData('kind', kind);
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
          {/* نوع الإعلان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع الإعلان *</Text>
            <View style={styles.kindSelector}>
              <TouchableOpacity
                style={[
                  styles.kindOption,
                  formData.kind === 'lost' && styles.kindOptionSelected,
                ]}
                onPress={() => selectKind('lost')}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={formData.kind === 'lost' ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.kindOptionText,
                    formData.kind === 'lost' && styles.kindOptionTextSelected,
                  ]}
                >
                  مفقود
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.kindOption,
                  formData.kind === 'found' && styles.kindOptionSelected,
                ]}
                onPress={() => selectKind('found')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={formData.kind === 'found' ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.kindOptionText,
                    formData.kind === 'found' && styles.kindOptionTextSelected,
                  ]}
                >
                  موجود
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="مثال: محفظة سوداء مفقودة في منطقة النرجس"
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
              placeholder="وصف تفصيلي للشيء المفقود أو الموجود..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* العلامات */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>العلامات (مفصولة بفاصلة)</Text>
            <TextInput
              style={styles.textInput}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="مثال: محفظة، سوداء، بطاقات، نرجس"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.helperText}>
              استخدم علامات لتسهيل البحث عن إعلانك
            </Text>
          </View>

          {/* بيانات إضافية */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات إضافية</Text>

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.color || ''}
              onChangeText={(value) =>
                updateFormData('metadata', { ...formData.metadata, color: value })
              }
              placeholder="اللون (مثال: أسود، أحمر، أزرق)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.location || ''}
              onChangeText={(value) =>
                updateFormData('metadata', { ...formData.metadata, location: value })
              }
              placeholder="الموقع (مثال: النرجس، الروضة)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.date || ''}
              onChangeText={(value) =>
                updateFormData('metadata', { ...formData.metadata, date: value })
              }
              placeholder="التاريخ (مثال: 2024-01-15)"
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
              <Text style={styles.submitButtonText}>إنشاء الإعلان</Text>
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
    flexDirection: 'row',
    gap: 12,
  },
  kindOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  kindOptionTextSelected: {
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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

export default MaaroufCreateScreen;
