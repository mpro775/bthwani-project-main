import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { RootStackParamList } from "@/types/navigation";
import { BLOOD_TYPES } from "@/types/types";
import {
  getDonorProfile,
  updateDonor,
  type Es3afniDonorProfile,
  type RegisterDonorPayload,
} from "@/api/es3afniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Es3afniDonorProfile"
>;

const Es3afniDonorProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Es3afniDonorProfile | null>(null);
  const [formData, setFormData] = useState<Partial<RegisterDonorPayload>>({
    bloodType: "O+",
    available: true,
  });

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getDonorProfile();
      setProfile(data);
      setFormData({
        bloodType: data.bloodType,
        available: data.available,
        lastDonation: data.lastDonation,
        city: data.city,
        governorate: data.governorate,
      });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        navigation.replace("Es3afniDonorRegister" as never);
      } else {
        Alert.alert("خطأ", "فشل في تحميل ملف المتبرع");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid, navigation]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!formData.bloodType) {
      Alert.alert("خطأ", "فصيلة الدم مطلوبة");
      return;
    }
    setSaving(true);
    try {
      await updateDonor(formData);
      Alert.alert("تم", "تم تحديث ملف المتبرع");
      loadProfile();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "فشل في التحديث";
      Alert.alert("خطأ", Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ملف المتبرع</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فصيلة الدم *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bloodType}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, bloodType: v }))
                }
                style={styles.picker}
              >
                {BLOOD_TYPES.map((bt) => (
                  <Picker.Item key={bt} label={bt} value={bt} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>متاح للتبرع الآن</Text>
              <Switch
                value={formData.available ?? true}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, available: v }))
                }
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تاريخ آخر تبرع</Text>
            <TextInput
              style={styles.textInput}
              value={formData.lastDonation || ""}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, lastDonation: v || undefined }))
              }
              placeholder="مثال: 2024-01-15"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المدينة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.city || ""}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, city: v || undefined }))
              }
              placeholder="مثال: صنعاء"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المحافظة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.governorate || ""}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, governorate: v || undefined }))
              }
              placeholder="مثال: أمانة العاصمة"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.white}
                />
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
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
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  scrollContainer: { flex: 1 },
  formContainer: { padding: 16 },
  section: { marginBottom: 24 },
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  picker: { height: 50, fontFamily: "Cairo-Regular", color: COLORS.text },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
    fontSize: 18,
    marginLeft: 8,
  },
});

export default Es3afniDonorProfileScreen;
