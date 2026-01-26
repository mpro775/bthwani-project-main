import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const formatTime12 = (time24: string): string => {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const period = h < 12 ? "ص" : "م";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
};

const ARABIC_DAYS: Record<string, string> = {
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
};

interface ScheduleItem {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

interface Props {
  business: {
    name: string;
    nameAr: string;
    logo: string;
    rating: number;
    distance: string;
    time: string;
    isOpen: boolean;
    categories?: string[];
    schedule?: ScheduleItem[];
  };
}

const BusinessInfoCard: React.FC<Props> = ({ business }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <Image source={{ uri: business.logo }} style={styles.logoImage} />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{business.name}</Text>

          <View style={styles.infoRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FFD600" />
              <Text style={styles.metaText}>
                {Number.isFinite(business.rating)
                  ? business.rating.toFixed(1)
                  : "—"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{business.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{business.distance}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: business.isOpen ? "#EAF7F2" : "#FFEBEE" },
              ]}
            >
              <Ionicons
                name={business.isOpen ? "checkmark-circle" : "close-circle"}
                size={14}
                color={business.isOpen ? COLORS.success : COLORS.danger}
                style={{ marginLeft: 2 }}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: business.isOpen ? COLORS.success : COLORS.danger },
                ]}
              >
                {business.isOpen ? "مفتوح" : "مغلق"}
              </Text>
            </View>
            <TouchableOpacity
              testID="calendar-button"
              style={styles.timeBtn}
              onPress={() => setShowSchedule(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={17}
                color={COLORS.accent}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal - أوقات الدوام */}
      <Modal
        visible={showSchedule}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSchedule(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>أوقات الدوام</Text>
            <ScrollView style={{ maxHeight: 240 }}>
              {business.schedule?.map((s, i) => (
                <View key={i} style={styles.modalRow}>
                  <Text style={styles.modalDay}>
                    {ARABIC_DAYS[s.day.toLowerCase()] || s.day}
                  </Text>
                  <Text style={styles.modalTime}>
                    {s.open
                      ? `${formatTime12(s.from)} - ${formatTime12(s.to)}`
                      : "مغلق"}
                  </Text>
                </View>
              ))}
              {!business.schedule?.length && (
                <Text style={styles.modalEmpty}>لا توجد بيانات</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              testID="close-modal-button"
              style={styles.modalClose}
              onPress={() => setShowSchedule(false)}
            >
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: -60,
    elevation: 7,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 92,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginLeft: 10,
    backgroundColor: "#FAFAFA",
  },
  name: {
    fontFamily: "Cairo-Bold",
    fontSize: 15,
    color: COLORS.blue,
  },
  nameAr: {
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: COLORS.gray,
  },
  categories: {
    fontFamily: "Cairo-Regular",
    fontSize: 11.5,
    color: COLORS.gray,
    marginLeft: 8,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 3,
  },
  metaText: {
    fontFamily: "Cairo-Medium",
    fontSize: 12.5,
    color: COLORS.blue,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  statusText: {
    fontFamily: "Cairo-Bold",
    fontSize: 12,
    marginLeft: 2,
  },
  timeBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#F3E8E6",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    width: 320,
    maxWidth: "94%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: "Cairo-Bold",
    textAlign: "center",
    marginBottom: 10,
    color: COLORS.primary,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },
  modalDay: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
    color: COLORS.text,
  },
  modalTime: {
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: COLORS.primary,
  },
  modalEmpty: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontFamily: "Cairo-Regular",
    fontSize: 13,
  },
  modalClose: {
    alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginTop: 12,
  },
  modalCloseText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    textAlign: "center",
  },
});

export default BusinessInfoCard;
