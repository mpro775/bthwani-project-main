import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Es3afniItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface Es3afniCardProps {
  item: Es3afniItem;
  onPress: () => void;
}

const URGENCY_LABELS: Record<string, string> = {
  low: "منخفض",
  normal: "عادي",
  urgent: "عاجل",
  critical: "حرج",
};
const URGENCY_COLORS: Record<string, string> = {
  low: COLORS.gray,
  normal: COLORS.primary,
  urgent: COLORS.orangeDark,
  critical: COLORS.danger,
};

const Es3afniCard: React.FC<Es3afniCardProps> = ({ item, onPress }) => {
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
      case "expired":
        return COLORS.gray;
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
      case "expired":
        return "منتهي";
      default:
        return status;
    }
  };

  const getExpiresInText = (expiresAt?: string | Date) => {
    if (!expiresAt) return null;
    try {
      const end = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      const now = new Date();
      if (end <= now) return "منتهي";
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) return `ينتهي بعد ${Math.floor(hours / 24)} يوم`;
      if (hours > 0) return `ينتهي بعد ${hours} ساعة`;
      return `ينتهي بعد ${mins} دقيقة`;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getBloodTypeIcon = (bloodType?: string) => {
    if (!bloodType) return "water-outline";
    return "water";
  };

  const getBloodTypeColor = (bloodType?: string) => {
    if (!bloodType) return COLORS.gray;
    // Critical blood types get red color
    if (["O-", "AB-", "B-"].includes(bloodType)) {
      return COLORS.danger;
    }
    return COLORS.primary;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.bloodTypeContainer}>
          <Ionicons
            name={getBloodTypeIcon(item.bloodType)}
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.bloodTypeText}>
            {item.bloodType || "غير محدد"}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          {item.urgency && (
            <View
              style={[
                styles.urgencyBadge,
                {
                  backgroundColor:
                    URGENCY_COLORS[item.urgency] || COLORS.primary,
                },
              ]}
            >
              <Text style={styles.urgencyText}>
                {URGENCY_LABELS[item.urgency] || item.urgency}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>
      {item.status === "pending" && getExpiresInText(item.expiresAt) && (
        <View style={styles.expiresRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.orangeDark} />
          <Text style={styles.expiresText}>
            {getExpiresInText(item.expiresAt)}
          </Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      )}

      {item.metadata?.unitsNeeded && (
        <View style={styles.unitsContainer}>
          <Ionicons name="flask-outline" size={14} color={COLORS.lightText} />
          <Text style={styles.unitsText}>
            مطلوب: {item.metadata.unitsNeeded} وحدة
          </Text>
        </View>
      )}

      {item.metadata?.contact && (
        <View style={styles.contactContainer}>
          <Ionicons name="call-outline" size={14} color={COLORS.lightText} />
          <Text style={styles.contactText}>{item.metadata.contact}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          إنشاء: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
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
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  expiresRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  expiresText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.orangeDark,
    marginLeft: 4,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bloodTypeText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    marginLeft: 6,
    color: COLORS.white,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 6,
    flex: 1,
  },
  unitsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  unitsText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 4,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
});

export default Es3afniCard;
