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
import { SanadItem, UpdateSanadPayload, SanadKind } from "@/types/types";
import { getSanadDetails, updateSanad } from "@/api/sanadApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "SanadEdit">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SanadEdit">;

const SanadEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<SanadItem | null>(null);

  const [formData, setFormData] = useState<UpdateSanadPayload>({
    title: '',
    description: '',
    kind: undefined,
    metadata: {},
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getSanadDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || '',
        kind: itemData.kind,
        metadata: itemData.metadata || {},
        status: itemData.status,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات الطلب:", error);
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
      await updateSanad(itemId, formData);
      Alert.alert(
        'نجح',
        'تم تحديث الطلب بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في تحديث الطلب:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateSanadPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectKind = (kind: SanadKind) => {
    updateFormData('kind', kind);
  };

  const selectStatus = (status: string) => {
    updateFormData('status', status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return COLORS.gray;
      case 'pending': return COLORS.orangeDark;
      case 'confirmed': return COLORS.primary;
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
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
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
        <Text style={styles.errorText}>ليس لديك صلاحية تعديل هذا الطلب</Text>
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
        <Text style={styles.headerTitle}>تعديل الطلب</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* نوع الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع الطلب</Text>
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

          {/* حالة الطلب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة الطلب</Text>
            <View style={styles.statusSelector}>
              {['draft', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
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
              placeholder="وصف تفصيلي للطلب..."
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

export default SanadEditScreen;
