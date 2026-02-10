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
import {
  KawaderItem,
  UpdateKawaderPayload,
  KawaderStatus,
  WORK_SCOPES,
  KawaderOfferType,
  KawaderJobType,
} from "@/types/types";
import { getKawaderDetails, updateKawader } from "@/api/kawaderApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "KawaderEdit">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KawaderEdit"
>;

const KawaderEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { itemId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<KawaderItem | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  const [formData, setFormData] = useState<UpdateKawaderPayload>({
    title: "",
    description: "",
    scope: "",
    budget: undefined,
    metadata: {
      experience: "",
      skills: [],
      location: "",
      remote: false,
    },
    status: undefined,
  });

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const itemData = await getKawaderDetails(itemId);
      setOriginalItem(itemData);

      // Initialize form with existing data
      setFormData({
        title: itemData.title,
        description: itemData.description || "",
        scope: itemData.scope || "",
        budget: itemData.budget,
        offerType: itemData.offerType,
        jobType: itemData.jobType,
        location: itemData.location,
        salary: itemData.salary,
        metadata: itemData.metadata || {
          experience: "",
          skills: [],
          location: "",
          remote: false,
        },
        status: itemData.status,
      });

      // Set skills input
      setSkillsInput((itemData.metadata?.skills || []).join(", "));
    } catch (error) {
      console.error("خطأ في تحميل بيانات الكادر:", error);
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
      Alert.alert("خطأ", "يرجى إدخال عنوان العرض الوظيفي");
      return;
    }

    setSaving(true);
    try {
      const processedSkills = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const payload: UpdateKawaderPayload = {
        ...formData,
        metadata: {
          ...formData.metadata,
          skills: processedSkills,
        },
      };

      await updateKawader(itemId, payload);
      Alert.alert("نجح", "تم تحديث العرض الوظيفي بنجاح", [
        {
          text: "موافق",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("خطأ في تحديث العرض الوظيفي:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء تحديث العرض الوظيفي. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateKawaderPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return COLORS.gray;
      case "pending":
        return COLORS.orangeDark;
      case "confirmed":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "مسودة";
      case "pending":
        return "في الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
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
        <Text style={styles.errorText}>
          ليس لديك صلاحية تعديل هذا العرض الوظيفي
        </Text>
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
        <Text style={styles.headerTitle}>تعديل العرض الوظيفي</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* العنوان */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان العرض الوظيفي *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              placeholder="عنوان العرض الوظيفي"
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
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="وصف تفصيلي للعرض الوظيفي..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* النطاق */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نطاق العمل</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scopeScroll}
            >
              <View style={styles.scopeContainer}>
                {WORK_SCOPES.map((scope) => (
                  <TouchableOpacity
                    key={scope}
                    style={[
                      styles.scopeOption,
                      formData.scope === scope && styles.scopeOptionSelected,
                    ]}
                    onPress={() => updateFormData("scope", scope)}
                  >
                    <Text
                      style={[
                        styles.scopeOptionText,
                        formData.scope === scope &&
                          styles.scopeOptionTextSelected,
                      ]}
                    >
                      {scope}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* نوع العرض */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع العرض</Text>
            <View style={styles.scopeContainer}>
              {[
                { key: "job" as KawaderOfferType, label: "وظيفة" },
                { key: "service" as KawaderOfferType, label: "خدمة" },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.scopeOption,
                    formData.offerType === key && styles.scopeOptionSelected,
                  ]}
                  onPress={() => updateFormData("offerType", key)}
                >
                  <Text
                    style={[
                      styles.scopeOptionText,
                      formData.offerType === key &&
                        styles.scopeOptionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* نوع الوظيفة (عندما النوع = وظيفة) */}
          {formData.offerType === "job" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نوع الوظيفة</Text>
              <View style={styles.scopeContainer}>
                {[
                  { key: "full_time" as KawaderJobType, label: "دوام كامل" },
                  { key: "part_time" as KawaderJobType, label: "جزئي" },
                  { key: "remote" as KawaderJobType, label: "عن بُعد" },
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.scopeOption,
                      formData.jobType === key && styles.scopeOptionSelected,
                    ]}
                    onPress={() => updateFormData("jobType", key)}
                  >
                    <Text
                      style={[
                        styles.scopeOptionText,
                        formData.jobType === key &&
                          styles.scopeOptionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* الموقع */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location ?? ""}
              onChangeText={(value) =>
                updateFormData("location", value || undefined)
              }
              placeholder="مثال: صنعاء، عدن"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* الميزانية / الراتب */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الميزانية / الراتب (ريال)</Text>
            <TextInput
              style={styles.textInput}
              value={
                formData.salary?.toString() ?? formData.budget?.toString() ?? ""
              }
              onChangeText={(value) => {
                const numValue = value ? parseFloat(value) : undefined;
                updateFormData("salary", numValue);
                updateFormData("budget", numValue);
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
              value={formData.metadata?.experience || ""}
              onChangeText={(value) => updateMetadata("experience", value)}
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
              value={formData.metadata?.location || ""}
              onChangeText={(value) => updateMetadata("location", value)}
              placeholder="الموقع (مثال: صنعاء، عدن)"
              placeholderTextColor={COLORS.textLight}
            />

            <TextInput
              style={styles.textInput}
              value={formData.metadata?.contact || ""}
              onChangeText={(value) => updateMetadata("contact", value)}
              placeholder="رقم التواصل (اختياري)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                updateMetadata("remote", !formData.metadata?.remote)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.metadata?.remote && styles.checkboxChecked,
                ]}
              >
                {formData.metadata?.remote && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>متاح العمل عن بعد</Text>
            </TouchableOpacity>
          </View>

          {/* الحالة */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حالة العرض</Text>
            <View style={styles.statusSelector}>
              {["draft", "pending", "confirmed", "completed", "cancelled"].map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && [
                        styles.statusOptionSelected,
                        { borderColor: getStatusColor(status) },
                      ],
                    ]}
                    onPress={() =>
                      updateFormData("status", status as KawaderStatus)
                    }
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.status === status &&
                          styles.statusOptionTextSelected,
                      ]}
                    >
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
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
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
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
    fontWeight: "600",
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
    textAlignVertical: "top",
  },
  scopeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scopeContainer: {
    flexDirection: "row",
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
    fontWeight: "500",
    color: COLORS.text,
  },
  scopeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "500",
    color: COLORS.text,
  },
  statusOptionTextSelected: {
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default KawaderEditScreen;
