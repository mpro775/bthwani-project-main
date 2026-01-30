import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ArabonItem } from "@/types/types";
import COLORS from "@/constants/colors";

interface ArabonCardProps {
  item: ArabonItem;
  onPress: () => void;
}

const BOOKING_PERIOD_LABELS: Record<string, string> = {
  hour: "ريال/ساعة",
  day: "ريال/يوم",
  week: "ريال/أسبوع",
};

const ArabonCard: React.FC<ArabonCardProps> = ({ item, onPress }) => {
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
    return `${amount.toFixed(0)} ريال`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
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

  const primaryImage = item.images?.[0];
  const priceLabel = item.pricePerPeriod
    ? `${formatCurrency(item.pricePerPeriod)} ${BOOKING_PERIOD_LABELS[item.bookingPeriod || "day"] || ""}`
    : item.bookingPrice
      ? formatCurrency(item.bookingPrice)
      : formatCurrency(item.depositAmount);

  const isUpcoming = () => {
    if (!item.scheduleAt) return false;
    const scheduleDate = new Date(item.scheduleAt);
    const now = new Date();
    return (
      scheduleDate > now &&
      item.status !== "completed" &&
      item.status !== "cancelled"
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {primaryImage ? (
        <Image
          source={{ uri: primaryImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverImage, styles.coverPlaceholder]}>
          <Ionicons name="images-outline" size={40} color={COLORS.textLight} />
        </View>
      )}

      <View style={styles.content}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{priceLabel}</Text>
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

        {item.contactPhone && (
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={14} color={COLORS.primary} />
            <Text style={styles.contactText}>{item.contactPhone}</Text>
          </View>
        )}

        {item.scheduleAt && (
          <View style={styles.scheduleContainer}>
            <Ionicons
              name={isUpcoming() ? "calendar-outline" : "checkmark-circle-outline"}
              size={16}
              color={isUpcoming() ? COLORS.primary : COLORS.success}
            />
            <Text
              style={[
                styles.scheduleText,
                { color: isUpcoming() ? COLORS.primary : COLORS.success },
              ]}
            >
              {formatDate(item.scheduleAt)}
            </Text>
          </View>
        )}

        {item.metadata?.guests && (
          <View style={styles.guestsContainer}>
            <Ionicons name="people-outline" size={14} color={COLORS.lightText} />
            <Text style={styles.guestsText}>
              {item.metadata.guests} شخص
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.dateText}>
            إنشاء: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceContainer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 8,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  guestsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  guestsText: {
    fontSize: 12,
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
    color: COLORS.lightText,
  },
});

export default ArabonCard;
