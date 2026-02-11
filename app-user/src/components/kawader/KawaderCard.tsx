import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { KawaderItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface KawaderCardProps {
  item: KawaderItem;
  onPress: () => void;
}

const KawaderCard: React.FC<KawaderCardProps> = ({ item, onPress }) => {
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toLocaleString("ar-SA")} ريال`;
  };

  const locationStr = item.location ?? item.metadata?.location;
  const amount = item.salary ?? item.budget;
  const jobTypeLabel =
    item.jobType === "full_time"
      ? "دوام كامل"
      : item.jobType === "part_time"
        ? "جزئي"
        : item.jobType === "remote"
          ? "عن بُعد"
          : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetText}>{formatCurrency(amount)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {(item.scope || jobTypeLabel) && (
        <View style={styles.scopeContainer}>
          <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
          <Text style={styles.scopeText}>
            {[item.scope, jobTypeLabel].filter(Boolean).join(" · ")}
          </Text>
        </View>
      )}

      {item.metadata?.skills && item.metadata.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsLabel}>المهارات:</Text>
          <View style={styles.skillsList}>
            {item.metadata.skills.slice(0, 2).map((skill, index) => (
              <Text key={index} style={styles.skill}>
                {skill}
              </Text>
            ))}
            {item.metadata.skills.length > 2 && (
              <Text style={styles.moreSkills}>
                +{item.metadata.skills.length - 2}
              </Text>
            )}
          </View>
        </View>
      )}

      {(locationStr || item.metadata?.remote) && (
        <View style={styles.locationContainer}>
          <Ionicons
            name="location-outline"
            size={14}
            color={COLORS.lightText}
          />
          <Text style={styles.locationText}>
            {locationStr || ""}
            {item.metadata?.remote && (locationStr ? " (عن بعد)" : "عن بعد")}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          نشر: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  budgetText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.success,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 20,
  },
  scopeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scopeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
    marginLeft: 6,
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillsLabel: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skill: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.primary,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  moreSkills: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
});

export default KawaderCard;
