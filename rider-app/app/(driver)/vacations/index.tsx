// app/(driver)/vacations/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestVacation, listVacations } from "../../../src/api/driver";
import { COLORS } from "../../../constants/colors";

interface Vacation {
  _id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function VacationsScreen() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchVacations = async () => {
    try {
      const data = await listVacations();
      setVacations(data);
    } catch (error) {
      console.error("Error fetching vacations:", error);
      Alert.alert("خطأ", "فشل في تحميل طلبات الإجازات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVacations();
  }, []);

  const handleSubmit = async () => {
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول");
      return;
    }

    setSubmitting(true);
    try {
      await requestVacation({
        fromDate: new Date(formData.fromDate),
        toDate: new Date(formData.toDate),
        reason: formData.reason,
      });

      Alert.alert("نجح", "تم إرسال طلب الإجازة بنجاح");
      setShowForm(false);
      setFormData({ fromDate: "", toDate: "", reason: "" });
      fetchVacations();
    } catch (error) {
      console.error("Error submitting vacation:", error);
      Alert.alert("خطأ", "فشل في إرسال طلب الإجازة");
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVacations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return COLORS.success;
      case "rejected":
        return COLORS.error;
      case "pending":
        return COLORS.orangeDark;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "معتمد";
      case "rejected":
        return "مرفوض";
      case "pending":
        return "قيد المراجعة";
      default:
        return status;
    }
  };

  const renderVacation = ({ item }: { item: Vacation }) => (
    <View style={styles.vacationCard}>
      <View style={styles.vacationHeader}>
        <Text style={styles.dateText}>
          من: {new Date(item.fromDate).toLocaleDateString("ar-SA")}
        </Text>
        <Text style={styles.dateText}>
          إلى: {new Date(item.toDate).toLocaleDateString("ar-SA")}
        </Text>
      </View>

      <Text style={styles.reasonText}>{item.reason}</Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
        <Text style={styles.createdText}>
          طُلب في: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل طلبات الإجازات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>طلبات الإجازات</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>طلب إجازة جديد</Text>

          <TextInput
            style={styles.input}
            placeholder="تاريخ البداية (YYYY-MM-DD)"
            value={formData.fromDate}
            onChangeText={(text) =>
              setFormData({ ...formData, fromDate: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="تاريخ النهاية (YYYY-MM-DD)"
            value={formData.toDate}
            onChangeText={(text) =>
              setFormData({ ...formData, toDate: text })
            }
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="سبب الإجازة"
            value={formData.reason}
            onChangeText={(text) =>
              setFormData({ ...formData, reason: text })
            }
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            <Button
              title={submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
              onPress={handleSubmit}
              disabled={submitting}
            />
            <Button
              title="إلغاء"
              onPress={() => setShowForm(false)}
              color={COLORS.error}
            />
          </View>
        </View>
      )}

      <FlatList
        data={vacations}
        renderItem={renderVacation}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد طلبات إجازات</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 25,
  },
  formContainer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  vacationCard: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vacationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  reasonText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
  },
  createdText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 16,
  },
});
